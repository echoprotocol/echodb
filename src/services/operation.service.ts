import OperationRepository from '../repositories/operation.repository';
import * as ECHO from '../constants/echo.constants';
import * as API from '../constants/api.constants';
import { AccountId, ContractId, AssetId } from 'types/echo';
import { HistoryOptionsWithInterval, HistoryOptions } from '../interfaces/IHistoryOptions';
import { IOperation } from '../interfaces/IOperation';
import { parseHistoryOptions } from '../utils/common';
import HISTORY_INTERVAL_ERROR from '../errors/history.interval.error';
import BlockRepository from 'repositories/block.repository';
import ProcessingError from '../errors/processing.error';

export enum KEY {
	FROM = 'from',
	TO = 'to',
	ACCOUNTS = 'accounts',
	CONTRACTS = 'contracts',
	ASSETS = 'assets',
	TOKENS = 'tokens',
	OPERATIONS = 'operations',
	SORT = 'sort',
}

export const ERROR = {
	BLOCK_NOT_FOUND: 'invalid block round',
};

interface GetHistoryParameters {
	[KEY.FROM]?: AccountId[];
	[KEY.TO]?: AccountId[];
	[KEY.ACCOUNTS]?: AccountId[];
	[KEY.CONTRACTS]?: ContractId[];
	[KEY.ASSETS]?: AssetId[];
	[KEY.TOKENS]?: ContractId[];
	[KEY.OPERATIONS]?: ECHO.OPERATION_ID[];
	[KEY.SORT]?: API.SORT_DESTINATION;
}

interface GetSubjectHistoryParameters {
	[KEY.ACCOUNTS]?: AccountId[];
	[KEY.CONTRACTS]?: ContractId[];
	[KEY.ASSETS]?: AssetId[];
	[KEY.TOKENS]?: ContractId[];
	[KEY.OPERATIONS]?: ECHO.OPERATION_ID[];
	[KEY.SORT]?: API.SORT_DESTINATION;
}

type Query = { [x: string]: Query[] | { $in: (ECHO.OPERATION_ID | string)[] } | { $or: Query[] } };

export default class OperationService {

	constructor(
		readonly operationRepository: OperationRepository,
		readonly blockRepository: BlockRepository,
	) { }

	async getOperationByBlockAndPosition(block: number, trxInBlock: number, opInTrx: number, isVirtual: boolean) {
		const dBlock = await this.blockRepository.findOne({ round: block });
		if (dBlock === null) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}

		let operation;
		if (isVirtual !== null && isVirtual !== undefined) {
			operation = await this.operationRepository.findOne({
				block: dBlock._id,
				trx_in_block: trxInBlock,
				op_in_trx: opInTrx,
				virtual: isVirtual,
			});
		} else {
			operation = await this.operationRepository.findOne({
				block: dBlock._id,
				trx_in_block: trxInBlock,
				op_in_trx: opInTrx,
			});
		}
		return operation;
	}

	async getHistory(count: number, offset: number, params: GetHistoryParameters) {
		const query: Query = {};
		const accountsQuery: Query[] = [];
		const otherQuery: Query[] = [];

		if (params.operations) query.id = { $in: params.operations };
		if (params.from) query['_relation.from'] = { $in: params.from };
		if (params.to) query['_relation.to'] = { $in: params.to };

		if (params.accounts) {
			accountsQuery.push(
				{ '_relation.from': { $in: params.accounts } },
				{ '_relation.to': { $in: params.accounts } },
				{ '_relation.accounts': { $in: params.accounts } },
			);
		}

		if (params.contracts) otherQuery.push({ '_relation.contracts': { $in: params.contracts } });
		if (params.assets) otherQuery.push({ '_relation.assets': { $in: params.assets } });
		if (params.tokens) otherQuery.push({ '_relation.tokens': { $in: params.tokens } });

		if (accountsQuery.length && otherQuery.length) {
			query.$and = [{ $or: accountsQuery }, { $or: otherQuery }];
		} else {
			if (accountsQuery.length) query.$or = accountsQuery;
			if (otherQuery.length) query.$or = otherQuery;
		}

		const sortDestination = params.sort === API.SORT_DESTINATION.ASC ? 1 : -1;
		const [items, total] = await Promise.all([
			this.operationRepository.find(
				query,
				null,
				{ skip: offset, limit: count, sort: { timestamp: sortDestination } },
			),
			this.operationRepository.count(query),
		]);
		return { total, items };
	}

	async getOpsCount(historyOpts: HistoryOptions) {
		const from = new Date(historyOpts.from);
		const to = historyOpts.to ? new Date(historyOpts.to) : new Date();
		const operationsCount = await this.operationRepository.count({ timestamp: { $gte: from, $lte: to } });
		return operationsCount;
	}

	async getOperationsCountByDate(from: string, to?: string) {
		return this.operationRepository.count({ timestamp: { $gte: from, $lte: new Date(to || Date.now()) } });
	}

	divideOperationByDate(
		array: IOperation[],
		startDate: number,
		interval: number,
	): Map<number, IOperation[]> {
		const blocksMap: Map<number, IOperation[]> = new Map();
		return array.reduce((acc: Map<number, IOperation[]>, val: IOperation) => {
			const timestamp = val.timestamp.getTime() / 1000;
			const segmentNumber = Math.ceil((timestamp - startDate) / interval);
			return acc.set(segmentNumber, acc.get(segmentNumber) ? [...acc.get(segmentNumber), val] : [val]);
		}, blocksMap);
	}

	async getOperationCountHistory(historyOpts?: HistoryOptionsWithInterval) {
		if (!historyOpts) {
			throw new Error(HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS);
		}

		let ratesMap: Object[] = [];

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);

		const startDateInISO = new Date(startDate * 1000).toISOString();
		const endDateInISO = new Date(endDate * 1000).toISOString();

		const operationsCount = await this.getOperationsCountByDate(startDateInISO, endDateInISO);

		const match = { timestamp: { $gte: startDateInISO, $lte: new Date(endDateInISO || Date.now()) } };
		const projectPrepare = { timestamp: { $toLong: '$timestamp' }};
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
            count : { $sum : 1},
            value : { $avg : '$timestamp'}
		}
		const projectResult = {
			_id: 0,
			startIntervalDateString: { $toDate: '$value' },
			rate: { $toLong: '$count' }
		};

		const pipeline = [
			{ $match: match },
			{ $project: projectPrepare },
			{ $group: group },
			{ $project: projectResult },
		];

		ratesMap = await this.operationRepository.aggregate(pipeline);

		return {
			ratesMap,
			total: operationsCount,
		};
	}

	async getSubjectOperations(
		count: number,
		offset: number,
		subject: string,
		from?: string,
		to?: string,
		params?: GetSubjectHistoryParameters,
	) {
		const fromQuery: any = {
			'_relation.from': { $in: [subject] },
		};
		const toQuery: any = {
			'_relation.to': { $in: [subject] },
		};

		const mainQuery = [];
		const generalQuery: any = {};

		if (from && to) {
			if (![from, to].includes(subject)) {
				return {
					total: 0,
					items: [],
				};
			}
			fromQuery['_relation.from']['$in'] = [from];
			toQuery['_relation.to']['$in'] = [to];
			mainQuery.push(fromQuery, toQuery);
			generalQuery['$and'] = mainQuery;
		} else {
			if (from) {
				if (from === subject) {
					mainQuery.push(fromQuery);
				} else {
					fromQuery['_relation.from']['$in'] = [from];
					mainQuery.push(fromQuery, toQuery);
				}
				generalQuery['$and'] = mainQuery;
			} else if (to) {
				if (to === subject) {
					mainQuery.push(toQuery);
				} else {
					toQuery['_relation.to']['$in'] = [to];
					mainQuery.push(fromQuery, toQuery);
				}
				generalQuery['$and'] = mainQuery;
			} else {
				mainQuery.push(fromQuery, toQuery);
				generalQuery['$or'] = mainQuery;
			}
		}

		const queryWithOperationFilter = params.operations ? {
			...generalQuery,
			id: { $in: params.operations },
		} : generalQuery;
		const [items, total] = await Promise.all([
			this.operationRepository.find(queryWithOperationFilter,
				null, {
					skip: offset,
					limit: count,
					sort: { timestamp: params.sort === API.SORT_DESTINATION.ASC ? 1 : -1 },
				},
			),
			this.operationRepository.count(queryWithOperationFilter),
		]);

		return {
			total,
			items,
		};
	}
}
