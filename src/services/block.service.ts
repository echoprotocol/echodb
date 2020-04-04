import BN from 'bignumber.js';
import BlockRepository from '../repositories/block.repository';
import BalanceRepository from '../repositories/balance.repository';
import AssetRepository from '../repositories/asset.repository';
import ProcessingError from '../errors/processing.error';
import { IBlock, BlockWithInjectedVirtualOperations } from '../interfaces/IBlock';
import { DAY } from '../constants/time.constants';
import { DECENTRALIZATION_RATE_BLOCK_COUNT } from '../constants/block.constants';
import { CORE_ASSET, ZERO_ACCOUNT } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { removeDuplicates, calculateAverage } from '../utils/common';
import { HistoryOptionsWithInterval, HistoryOptions } from 'interfaces/IHistoryOptions';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
	INVALID_DATES: 'Start date is bigger then end date',
	INVALID_INTERVAL: 'The choosen period is smaller then interval',
	INVALID_HISTORY_PARAMS: 'parameter from or interval was not provided',
};

export default class BlockService {

	constructor(
		readonly blockRepository: BlockRepository,
		readonly balanceRepository: BalanceRepository,
		readonly assetRepository: AssetRepository,
	) {}

	async getBlock(round: number) {
		const dBlock = await this.blockRepository.findOne({ round });
		if (!dBlock) throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		return dBlock;
	}

	async getBlocks(count: number, offset: number) {
		const [items, total] = await Promise.all([
			this.blockRepository.find({} , null, {
				skip: offset,
				limit: count,
			}),
			this.blockRepository.count({}),
		]);
		return { total, items };
	}

	async getBlocksCount(historyOpts: HistoryOptions) {
		const from = new Date(historyOpts.from).toISOString();
		const to = historyOpts.to ? new Date(historyOpts.to) : new Date();
		const blocksCount = await this.blockRepository.count({ timestamp: { $gte: from, $lte: to } });
		return blocksCount;
	}

	async getDecentralizationRateFromBlock(block: BlockWithInjectedVirtualOperations) {
		const baseBlockOffset = block.round - DECENTRALIZATION_RATE_BLOCK_COUNT;
		const blockOffset = baseBlockOffset > 0 ? baseBlockOffset : 0;
		const decentralizationRateCalculatinBlocks =
			await this.getBlocks(DECENTRALIZATION_RATE_BLOCK_COUNT, blockOffset);
		const accountProducerIds = decentralizationRateCalculatinBlocks.items
			.map(({ account }) => account);
		const accountProducersCount = removeDuplicates(accountProducerIds).length;
		const baseAsset = await this.assetRepository.findById(CORE_ASSET);

		if (!baseAsset) {
			return 100;
		}

		const query = {
			amount: { $ne: '0' },
			_account: { $exists: true },
			_contract: { $exists: false },
			_asset: baseAsset._id,
			type: TYPE.ASSET,
		};
		const notZeroBalancesCount = await this.balanceRepository.count(query);

		if (notZeroBalancesCount === 0) {
			return 100;
		}

		const decentralizationRate = new BN(accountProducersCount).div(notZeroBalancesCount)
			.times(100).integerValue(BN.ROUND_CEIL).toNumber();
		return decentralizationRate > 100 ? 100 : decentralizationRate;
	}

	async getAverageBlockTime(block: BlockWithInjectedVirtualOperations) {
		const currentDate = new Date(block.timestamp).toISOString();
		const currentDateMs = new BN(Date.parse(currentDate));
		const yesterdayDate = new Date(currentDateMs.minus(DAY).toNumber()).toISOString();
		const blocksPer24Hours = (await this.getBlocksByDate(currentDate, yesterdayDate)).length;
		const averageBlockTime = blocksPer24Hours !== 0 ? new BN(DAY).div(blocksPer24Hours) : new BN(0);
		return averageBlockTime.integerValue().toNumber();
	}

	async updateBlockAfterParsing(block: BlockWithInjectedVirtualOperations) {
		const dBlock = await this.getBlock(block.round);

		const [
			decentralizationRate,
			averageBlockTime,
		] = await Promise.all([
			this.getDecentralizationRateFromBlock(block),
			this.getAverageBlockTime(block),
		]);

		dBlock.decentralization_rate = decentralizationRate;
		dBlock.average_block_time = averageBlockTime;

		await dBlock.save();

		return dBlock;
	}

	async getDecentralizationRate(historyOpts?: HistoryOptionsWithInterval) {
		if (Object.keys(historyOpts).length !== 0 && (!historyOpts.from || !historyOpts.interval)) {
			throw new ProcessingError(ERROR.INVALID_HISTORY_PARAMS);
		}

		const dBlocks = await this.blockRepository.find({}, {}, { sort: { round: -1 }, limit: 1 });
		if (!dBlocks[0]) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}
		const decentralizationRatePercent = dBlocks[0].decentralization_rate;

		const ratesMap: Object[] = [];

		if (Object.keys(historyOpts).length === 0) {
			return { decentralizationRatePercent, ratesMap };
		}

		const startDate = Date.parse(historyOpts.from) / 1000;
		const endDate = Date.parse(historyOpts.to || Date.now().toString()) / 1000;
		const interval = historyOpts.interval;

		if (endDate <= startDate) {
			throw new ProcessingError(ERROR.INVALID_DATES);
		}
		if (endDate - startDate < interval) {
			throw new ProcessingError(ERROR.INVALID_INTERVAL);
		}

		const blocks = await this.getBlocksByDate(historyOpts.from, historyOpts.to);

		if (blocks.length === 0) {
			return { decentralizationRatePercent, ratesMap };
		}

		const newMap: Map<number, IBlock[]> = new Map();
		const orderedBlocks = blocks
			.reduce((acc: Map<number, IBlock[]>, val: IBlock) => {
				const timestamp = Date.parse(val.timestamp) / 1000;
				const segmentNumber = Math.ceil((timestamp - startDate) / interval);
				return acc.set(segmentNumber, acc.get(segmentNumber) ? [...acc.get(segmentNumber), val] : [val]);
			}, newMap);

		for (const [time, blocks] of orderedBlocks) {
			const decentralizationRatePeriudArray = blocks
				.map(({ decentralization_rate }) => decentralization_rate || 0);
			const rate = calculateAverage(decentralizationRatePeriudArray).integerValue(BN.ROUND_CEIL).toNumber();
			const startIntervalDate = startDate + (interval * (time - 1));
			const startIntervalDateString = new Date(startIntervalDate * 1000).toISOString();
			ratesMap.push({ startIntervalDateString, rate });
		}

		return {
			decentralizationRatePercent,
			ratesMap,
		};
	}

	async getBlocksByDate(from: string, to?: string) {
		return this.blockRepository.find({ timestamp: { $gte: from, $lte: new Date(to || Date.now()) } });
	}

	private calculateDelegationRate(blocks: IBlock[]) {
		const blocksCount = blocks.length;
		const blocksWithDelegateProduser = blocks.filter((b) => b.delegate !== ZERO_ACCOUNT).length;
		const delegatePercent = (blocksWithDelegateProduser / blocksCount) * 100;
		return delegatePercent;
	}

	async getDelegationRate(historyOpts?: HistoryOptionsWithInterval) {
		if (historyOpts && (!historyOpts.from || !historyOpts.interval)) {
			throw new ProcessingError(ERROR.INVALID_HISTORY_PARAMS);
		}
		const blocks = await this.blockRepository.find({});
		const ratesMap: Object[] = [];
		if (blocks.length === 0) {
			return {
				ratesMap,
				delegatePercent: 0,
			};
		}
		const delegatePercent = this.calculateDelegationRate(blocks);
		if (!historyOpts) {
			return { delegatePercent };
		}

		const startDate = Date.parse(historyOpts.from) / 1000;
		const endDate = Date.parse(historyOpts.to || Date.now().toString()) / 1000;
		const interval = historyOpts.interval;
		if (endDate <= startDate) {
			throw new ProcessingError(ERROR.INVALID_DATES);
		}
		if (endDate - startDate < interval) {
			throw new ProcessingError(ERROR.INVALID_INTERVAL);
		}
		const newMap: Map<number, IBlock[]> = new Map();
		const orderedBlocks = blocks.filter((block) => {
			const blockTimestamp = Date.parse(block.timestamp) / 1000;
			return (blockTimestamp >= startDate) && (blockTimestamp <= endDate);
		}).reduce((acc: Map<number, IBlock[]>, val: IBlock) => {
			const timestamp = Date.parse(val.timestamp) / 1000;
			const segmentNumber = Math.ceil((timestamp - startDate) / interval);
			return acc.set(segmentNumber, acc.get(segmentNumber) ? [...acc.get(segmentNumber), val] : [val]);
		}, newMap);

		for (const [time, blocks] of orderedBlocks) {
			const rate = this.calculateDelegationRate(blocks);
			const startIntervalDate = startDate + (interval * (time - 1));
			const startIntervalDateString = new Date(startIntervalDate * 1000).toISOString();
			ratesMap.push({ startIntervalDateString, rate });
		}
		return {
			delegatePercent,
			ratesMap,
		};
	}
}
