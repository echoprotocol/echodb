import BN from 'bignumber.js';
import BlockRepository from '../repositories/block.repository';
import BalanceRepository from '../repositories/balance.repository';
import AssetRepository from '../repositories/asset.repository';
import ProcessingError from '../errors/processing.error';
import {
	IBlock,
	BlockWithInjectedVirtualOperations,
	OperationWithInjectedVirtualOperaitons,
} from '../interfaces/IBlock';
import { DAY } from '../constants/time.constants';
import { DECENTRALIZATION_RATE_BLOCK_COUNT } from '../constants/block.constants';
import { CORE_ASSET, ZERO_ACCOUNT } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { removeDuplicates, calculateAverage, parseHistoryOptions } from '../utils/common';
import { HistoryOptionsWithInterval, HistoryOptions } from '../interfaces/IHistoryOptions';
import { constants, validators } from 'echojs-lib';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
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

	private divideBlocksByDate(blocks: IBlock[], startDate: number, interval: number): Map<number, IBlock[]> {
		const blocksMap: Map<number, IBlock[]> = new Map();
		return blocks.reduce((acc: Map<number, IBlock[]>, val: IBlock) => {
			const timestamp = Date.parse(val.timestamp) / 1000;
			const segmentNumber = Math.ceil((timestamp - startDate) / interval);
			return acc.set(segmentNumber, acc.get(segmentNumber) ? [...acc.get(segmentNumber), val] : [val]);
		}, blocksMap);
	}

	private getFreezeOperations(block: BlockWithInjectedVirtualOperations) {
		const freezeVirtualOps = block.unlinked_virtual_operations
			.filter((vOp) => vOp.op[1] === constants.OPERATIONS_IDS.BALANCE_FREEZE)
			.map((vOp) => vOp.op);
		const freezeOps: OperationWithInjectedVirtualOperaitons[] = block.transactions
			.reduce((ops, trx) =>
				[...ops, ...trx.operations.filter((op) => op[0] === constants.OPERATIONS_IDS.BALANCE_FREEZE)],
			[]);
		const totalFreezeOps = [...freezeVirtualOps, ...freezeOps];

		const unfreezeVirtualOps = block.unlinked_virtual_operations
			.filter((vOp) => vOp.op[1] === constants.OPERATIONS_IDS.BALANCE_UNFREEZE)
			.map((vOp) => vOp.op);
		const unfreezeOps: OperationWithInjectedVirtualOperaitons[] = block.transactions
			.reduce((ops, trx) =>
				[...ops, ...trx.operations.filter((op) => op[0] === constants.OPERATIONS_IDS.BALANCE_UNFREEZE)],
				[]);
		const totalUnfreezeOps = [...unfreezeVirtualOps, ...unfreezeOps];
		return { totalFreezeOps, totalUnfreezeOps };
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
		const blocksPer24Hours = (await this.getBlocksByDate(yesterdayDate, currentDate)).length;
		const averageBlockTime = blocksPer24Hours !== 0 ? new BN(DAY).div(blocksPer24Hours) : new BN(0);
		return averageBlockTime.integerValue().toNumber();
	}

	async getFrozenAmounts(block: BlockWithInjectedVirtualOperations) {
		const targetRound = block.round === 0 ? 0 : block.round - 1;
		const latestBlock = await this.blockRepository.findByRound(targetRound);

		const { totalFreezeOps, totalUnfreezeOps } = this.getFreezeOperations(block);
		const accountsFreezeSum: BN = totalFreezeOps.reduce((sum, op) =>
			validators.isAccountId(op[1].account) ?
				sum.plus(op[1].amount.amount) :
				sum
			, new BN(0));
		const committeeFreezeSum: BN = totalFreezeOps.reduce((sum, op) =>
			validators.isCommitteeMemberId(op[1].account) ?
				sum.plus(op[1].amount.amount) :
				sum
			, new BN(0));

		const accountsUnfreezeSum: BN = totalUnfreezeOps.reduce((sum, op) =>
			validators.isAccountId(op[1].account) ?
				sum.plus(op[1].amount.amount) :
				sum
			, new BN(0));
		const committeeUnfreezeSum: BN = totalUnfreezeOps.reduce((sum, op) =>
			validators.isCommitteeMemberId(op[1].account) ?
				sum.plus(op[1].amount.amount) :
				sum
			, new BN(0));

		const { frozen_balances_data: { accounts_freeze_sum, committee_freeze_sum } } = latestBlock;
		const currentBlockFreezeAccountsFunds = accountsFreezeSum.minus(accountsUnfreezeSum);
		const currentBlockFreezeCommitteeFunds = committeeFreezeSum.minus(committeeUnfreezeSum);
		const totalFreezeAccountsFunds = new BN(accounts_freeze_sum).plus(currentBlockFreezeAccountsFunds);
		const totalFreezeCommitteeFunds = new BN(committee_freeze_sum).plus(currentBlockFreezeCommitteeFunds);
		return {
			accounts_freeze_sum: totalFreezeAccountsFunds.toNumber(),
			committee_freeze_sum: totalFreezeCommitteeFunds.toNumber(),
		};
	}

	async updateBlockAfterParsing(block: BlockWithInjectedVirtualOperations) {
		const dBlock = await this.getBlock(block.round);

		const [
			decentralizationRate,
			averageBlockTime,
			freezeAmounts,
		] = await Promise.all([
			this.getDecentralizationRateFromBlock(block),
			this.getAverageBlockTime(block),
			this.getFrozenAmounts(block),
		]);

		dBlock.decentralization_rate = decentralizationRate;
		dBlock.average_block_time = averageBlockTime;
		dBlock.frozen_balances_data = freezeAmounts;

		await dBlock.save();

		return dBlock;
	}

	async getDecentralizationRate(historyOpts?: HistoryOptionsWithInterval) {

		const dBlocks = await this.blockRepository.find({}, {}, { sort: { round: -1 }, limit: 1 });
		if (!dBlocks[0]) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}
		const decentralizationRatePercent = dBlocks[0].decentralization_rate;

		const ratesMap: Object[] = [];

		if (Object.keys(historyOpts).length === 0) {
			return { decentralizationRatePercent, ratesMap };
		}

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);
		const startDateInISO = new Date(startDate * 1000).toISOString();
		const endDateInISO = new Date(endDate * 1000).toISOString();

		const blocks = await this.getBlocksByDate(startDateInISO, endDateInISO);

		if (blocks.length === 0) {
			return { decentralizationRatePercent, ratesMap };
		}

		const orderedBlocks = this.divideBlocksByDate(blocks, startDate, interval);

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
		const blocks = await this.blockRepository.find({});
		const ratesMap: Object[] = [];
		if (blocks.length === 0) {
			return {
				ratesMap,
				delegatePercent: 0,
			};
		}
		const delegatePercent = this.calculateDelegationRate(blocks);
		if (Object.keys(historyOpts).length === 0) {
			return {
				ratesMap,
				delegatePercent,
			};
		}

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);
		const filteredBlocks = blocks.filter((block) => {
			const blockTimestamp = Date.parse(block.timestamp) / 1000;
			return (blockTimestamp >= startDate) && (blockTimestamp <= endDate);
		});
		const orderedBlocks = this.divideBlocksByDate(filteredBlocks, startDate, interval);

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

	async getFrozenData(historyOpts?: HistoryOptionsWithInterval) {
		const frozenData: Object[] = [];
		const latestBlock = await this.blockRepository.find({}, null, { sort: { round: -1 }, limit: 1 });
		if (!latestBlock[0]) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}
		const currentFrozenData = {
			accounts_freeze_sum: latestBlock[0].frozen_balances_data.accounts_freeze_sum,
			committee_freeze_sum: latestBlock[0].frozen_balances_data.committee_freeze_sum,
		};
		if (Object.keys(historyOpts).length === 0) {
			return {
				currentFrozenData,
				frozenData,
			};
		}
		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);
		const startDateInISO = new Date(startDate * 1000).toISOString();
		const endDateInISO = new Date(endDate * 1000).toISOString();
		const blocks = await this.getBlocksByDate(startDateInISO, endDateInISO);
		const orderedBlocks = this.divideBlocksByDate(blocks, startDate, interval);

		for (const [segment, blocksSegment] of orderedBlocks) {
			const frozenSums = {
				accounts_freeze_sum: 0,
				committee_freeze_sum: 0,
			};

			const accountsFreezeArray = blocksSegment
				.map(({ frozen_balances_data: { accounts_freeze_sum  } }) => accounts_freeze_sum);
			const committeeFreezeArray = blocksSegment
				.map(({ frozen_balances_data: { committee_freeze_sum } }) => committee_freeze_sum);

			frozenSums.accounts_freeze_sum = calculateAverage(accountsFreezeArray)
				.integerValue(BN.ROUND_CEIL).toNumber();
			frozenSums.committee_freeze_sum = calculateAverage(committeeFreezeArray)
				.integerValue(BN.ROUND_CEIL).toNumber();

			const startIntervalDate = startDate + (interval * (segment - 1));
			const startIntervalDateString = new Date(startIntervalDate * 1000).toISOString();
			frozenData.push({ startIntervalDateString, frozenSums });
		}
		return { currentFrozenData, frozenData };
	}
}
