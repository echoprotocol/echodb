import BN from 'bignumber.js';
import OperationRepository from '../repositories/operation.repository';
import * as ECHO from '../constants/echo.constants';
import * as API from '../constants/api.constants';
import { AccountId, ContractId, AssetId } from 'types/echo';
import { HistoryOptionsWithInterval, HistoryOptions } from '../interfaces/IHistoryOptions';
import { IOperation } from '../interfaces/IOperation';
import { parseHistoryOptions } from '../utils/common';
import HISTORY_INTERVAL_ERROR from '../errors/history.interval.error';

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
	) { }

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

	async getOperationsByDate(from: string, to?: string) {
		return this.operationRepository.find({ timestamp: { $gte: from, $lte: new Date(to || Date.now()) } });
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

		const ratesMap: Object[] = [];

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);
		const startDateInISO = new Date(startDate * 1000).toISOString();
		const endDateInISO = new Date(endDate * 1000).toISOString();
		const operrations = await this.getOperationsByDate(startDateInISO, endDateInISO);

		const orderedOperations = this.divideOperationByDate(operrations, startDate, interval);

		for (const [time, operations] of orderedOperations) {
			const rate = new BN(operations.length).integerValue(BN.ROUND_CEIL).toNumber();
			const startIntervalDate = startDate + (interval * (time - 1));
			const startIntervalDateString = new Date(startIntervalDate * 1000).toISOString();
			ratesMap.push({ startIntervalDateString, rate });
		}

		return {
			ratesMap,
			total: operrations.length,
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
