import OperationRepository from '../repositories/operation.repository';
import * as ECHO from '../constants/echo.constants';
import * as API from '../constants/api.constants';
import { AccountId, ContractId, AssetId } from 'types/echo';

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

	async getSubjectOperations(
		count: number,
		offset: number,
		subject: string,
		relationsSubjects?: string[],
		params?: GetHistoryParameters,
	) {
		type query = {
			'_relation.from'?: Object,
			'_relation.to'?: Object,
			'_relation.contracts'?: Object,
			'_relation.assets'?: Object,
			'_relation.tokens'?: Object,
		};
		const query: Query = {};
		const fromQuery: query = {
			'_relation.from': { $in: [subject] },
		};
		const toQuery: query = {
			'_relation.to': { $in: [subject] },
		};
		if (relationsSubjects.length) {
			fromQuery['_relation.to'] = { $in: relationsSubjects };
			toQuery['_relation.from'] = { $in: relationsSubjects };
		}

		const mainQuery = [fromQuery, toQuery];
		if (params.contracts) mainQuery.push({ '_relation.contracts': { $in: params.contracts } });
		if (params.assets) mainQuery.push({ '_relation.assets': { $in: params.assets } });
		if (params.tokens) mainQuery.push({ '_relation.tokens': { $in: params.tokens } });

		const accountsQuery = [];
		if (params.accounts) {
			accountsQuery.push(
				{ '_relation.from': { $in: params.accounts } },
				{ '_relation.to': { $in: params.accounts } },
				{ '_relation.accounts': { $in: params.accounts } },
			);
		}

		const [items, total] = await Promise.all([
			this.operationRepository.find(accountsQuery.length ?
				{ $and: [{ $or: accountsQuery }, { $or: mainQuery }] }
				: { $or: mainQuery },
				null, {
					skip: offset,
					limit: count,
					sort: { timestamp: params.sort === API.SORT_DESTINATION.ASC ? 1 : -1 },
				},
			),
			this.operationRepository.count({
				$or: [fromQuery, toQuery],
			}),
		]);

		return {
			total,
			items,
		};
	}
}
