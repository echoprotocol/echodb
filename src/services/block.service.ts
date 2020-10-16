import BN from 'bignumber.js';
import BlockRepository from '../repositories/block.repository';
import BalanceRepository from '../repositories/balance.repository';
import AssetRepository from '../repositories/asset.repository';
import ProcessingError from '../errors/processing.error';
import {
	BlockWithInjectedVirtualOperations,
	OperationWithInjectedVirtualOperaitons,
} from '../interfaces/IBlock';
import { DAY } from '../constants/time.constants';
import { DECENTRALIZATION_RATE_BLOCK_COUNT } from '../constants/block.constants';
import { CORE_ASSET, ZERO_ACCOUNT } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { removeDuplicates, parseHistoryOptions } from '../utils/common';
import { HistoryOptionsWithInterval, HistoryOptions } from '../interfaces/IHistoryOptions';
import { constants, validators } from 'echojs-lib';
import EchoRepository from 'repositories/echo.repository';
import { IAsset } from 'interfaces/IAsset';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
};

export default class BlockService {

	constructor(
		readonly blockRepository: BlockRepository,
		readonly balanceRepository: BalanceRepository,
		readonly assetRepository: AssetRepository,
		readonly echoRepository: EchoRepository,
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
			blockReward,
		] = await Promise.all([
			this.getDecentralizationRateFromBlock(block),
			this.getAverageBlockTime(block),
			this.getFrozenAmounts(block),
			this.getBlockReward(block),
		]);

		dBlock.decentralization_rate = decentralizationRate;
		dBlock.average_block_time = averageBlockTime;
		dBlock.frozen_balances_data = freezeAmounts;
		dBlock.block_reward = blockReward;

		await dBlock.save();

		return dBlock;
	}

	async getCurrentDecentralizationPercent() {
		const dBlocks = await this.blockRepository.find({}, {}, { sort: { round: -1 }, limit: 1 });

		if (!dBlocks[0]) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}

		const decentralizationPercent = dBlocks[0].decentralization_rate;

		return { decentralizationPercent };
	}

	async getDecentralizationRate(historyOpts?: HistoryOptionsWithInterval) {
		let ratesMap: Object[] = [];

		if (Object.keys(historyOpts).length === 0) {
			return { ratesMap };
		}

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);
		const startDateInISO = new Date(startDate);
		const endDateInISO = new Date(endDate);

		const match = { timestamp: { $gte: startDateInISO, $lte: new Date(endDateInISO || Date.now()) } };
		const projectPrepareTimestampToDate = {
			timestamp: { $toDate: '$timestamp' },
			decentralization_rate: '$decentralization_rate',
		};
		const projectPrepareTimestampToLong = {
			timestamp: { $toLong: '$timestamp' },
			decentralization_rate: '$decentralization_rate',
		};
		const intervalMS = interval * 1000;

		const group = {
            '_id' : {
                timestamp: {
					$subtract: [
						{$divide: ['$timestamp', intervalMS ] },
						{ $mod: [{$divide: ['$timestamp', intervalMS ]},1] }
					] 
				}
            },
            value : { $avg : '$timestamp' },
            rate : { $avg : '$decentralization_rate' }
		};

		const sortByDate = { value: 1 };

		const projectResult = {
			_id: 0,
			startIntervalDateString: { $toString: { $toDate: '$value' } },
			rate: { $toLong: '$rate' }
		};

		const pipeline = [
			{ $project: projectPrepareTimestampToDate },
			{ $match: match },
			{ $project: projectPrepareTimestampToLong },
			{ $group: group },
			{ $sort: sortByDate },
			{ $project: projectResult },
		];

		ratesMap = await this.blockRepository.aggregate(pipeline);

		return { ratesMap };
	}

	async getBlocksByDate(from: string, to?: string) {
		return this.blockRepository.find({ timestamp: { $gte: from, $lte: new Date(to || Date.now()) } });
	}

	private async calculateDelegationRate(blocksCount: number) {
		const blocksWithDelegateProducer = await this.blockRepository.count({ delegate: { $ne: ZERO_ACCOUNT } });
		return (blocksWithDelegateProducer / blocksCount) * 100;
	}

	async getCurrentDelegationPercent() {
		const blocksCount = await this.blockRepository.count({});

		if (blocksCount === 0) {
			return { delegatePercent: 0 };
		}

		const delegatePercent = await this.calculateDelegationRate(blocksCount);

		return { delegatePercent };
	}

	async getDelegationRateInterval(historyOpts?: HistoryOptionsWithInterval) {
		let ratesMap: Object[] = [];

		if (Object.keys(historyOpts).length === 0) {
			return {
				ratesMap,
			};
		}

		const blocksCount = await this.blockRepository.count({});

		if (blocksCount === 0 ) {
			return { ratesMap };
		}

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);

		const startDateInISO = new Date(startDate);
		const endDateInISO = new Date(endDate);

		const match = { timestamp: { $gte: startDateInISO, $lte: new Date(endDateInISO || Date.now()) } };
		const projectPrepareTimestampToDate = {
			timestamp: { $toDate: '$timestamp' },
			nonZeroDelegate: { $cond: [{ $ne: ['$delegate', ZERO_ACCOUNT] }, 1, 0] },
		};
		const projectPrepareTimestampToLong = {
			timestamp: { $toLong: '$timestamp' },
			nonZeroDelegate: '$nonZeroDelegate',
		};
		const intervalMS = interval * 1000;

		const group = {
            '_id' : {
                timestamp: {
					$subtract: [
						{$divide: ['$timestamp', intervalMS ] },
						{ $mod: [{$divide: ['$timestamp', intervalMS ]},1] }
					] 
				}
            },
            count : { $sum : 1 },
			value : { $avg : '$timestamp' },
			nonZeroDelegateCount: { $sum: '$nonZeroDelegate' }
		};

		const sortByDate = { value: 1 };

		const projectResult = {
			_id: 0,
			startIntervalDateString: { $toString: { $toDate: '$value' } },
			rate: { $multiply: [{ $divide: ['$nonZeroDelegateCount', '$count'] }, 100] }
		};

		const pipeline = [
			{ $project: projectPrepareTimestampToDate },
			{ $match: match },
			{ $project: projectPrepareTimestampToLong },
			{ $group: group },
			{ $sort: sortByDate },
			{ $project: projectResult },
		];

		ratesMap = await this.blockRepository.aggregate(pipeline);

		return { ratesMap };
	}

	async getCurrentFrozenData() {
		const latestBlock = await this.blockRepository.find({}, null, { sort: { round: -1 }, limit: 1 });

		if (!latestBlock[0]) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}

		const currentFrozenData = {
			accounts_freeze_sum: latestBlock[0].frozen_balances_data.accounts_freeze_sum,
			committee_freeze_sum: latestBlock[0].frozen_balances_data.committee_freeze_sum,
		};

		return {
			currentFrozenData,
		};
	}

	async getFrozenRateInterval(historyOpts?: HistoryOptionsWithInterval) {
		let frozenData: Object[] = [];

		if (Object.keys(historyOpts).length === 0) {
			return {
				frozenData,
			};
		}
		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);

		const startDateInISO = new Date(startDate);
		const endDateInISO = new Date(endDate);

		const match = { timestamp: { $gte: startDateInISO, $lte: new Date(endDateInISO || Date.now()) } };
		const projectPrepareTimestampToDate = {
			timestamp: { $toDate: '$timestamp' },
			accounts_freeze_sum: '$frozen_balances_data.accounts_freeze_sum',
			committee_freeze_sum: '$frozen_balances_data.committee_freeze_sum'
		};
		const projectPrepareTimestampToLong = {
			timestamp: { $toLong: '$timestamp' },
			accounts_freeze_sum: '$accounts_freeze_sum',
			committee_freeze_sum: '$committee_freeze_sum'
		};
		const intervalMS = interval * 1000;

		const group = {
            '_id' : {
                timestamp: {
					$subtract: [
						{$divide: ['$timestamp', intervalMS ] },
						{ $mod: [{$divide: ['$timestamp', intervalMS ]},1] }
					] 
				}
            },
            value : { $avg : '$timestamp'},
            accounts_freeze_sum : { $avg : '$accounts_freeze_sum'},
            committee_freeze_sum : { $avg : '$committee_freeze_sum'}
		}

		const sortByDate = { value: 1 };

		const projectResult = {
			_id: 0,
			startIntervalDateString: { $toString: { $toDate: '$value' } },
			'frozenSums.accounts_freeze_sum': { $toLong: '$accounts_freeze_sum' },
			'frozenSums.committee_freeze_sum': { $toLong: '$committee_freeze_sum' }
		};

		const pipeline = [
			{ $project: projectPrepareTimestampToDate },
			{ $match: match },
			{ $project: projectPrepareTimestampToLong },
			{ $group: group },
			{ $sort: sortByDate },
			{ $project: projectResult },
		];

		frozenData = await this.blockRepository.aggregate(pipeline);

		return { frozenData };
	}

	async getBlockReward(block: BlockWithInjectedVirtualOperations): Promise<string> {
		const { transactions } = block;

		const rewardPromises = transactions.map(async (trx) => {
			let totalFeesToEcho = new BN(0);
			if (trx.fees_collected) {
				const feePromises = trx.fees_collected.map(async (fee) => {
					const dAsset = await this.assetRepository.findById(fee.asset_id);
					const { options: { core_exchange_rate: assetCoreRate } } = dAsset;
					const assetPrice = new BN(assetCoreRate.base.amount).div(assetCoreRate.quote.amount);
					const assetConvertToEcho = assetPrice.multipliedBy(fee.amount);
					return assetConvertToEcho.toString(10);
				});
				totalFeesToEcho = (await Promise.all(feePromises)).reduce((acc, val) => acc.plus(val), new BN(0));
			}
			return totalFeesToEcho;
		});
		const blockReward = (await Promise.all(rewardPromises)).reduce((acc, val) => acc.plus(val), new BN(0));
		const coreAsset = await this.echoRepository.getObject(CORE_ASSET);
		return blockReward.div(10 ** (<IAsset>coreAsset).precision).toString(10);
	}
}
