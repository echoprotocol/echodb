import OperationRepository from '../repositories/operation.repository';
import * as ECHO from '../constants/echo.constants';
import { AccountId, ContractId, AssetId } from 'types/echo';

export enum KEY {
	FROM = 'from',
	TO = 'to',
	ACCOUNTS = 'accounts',
	CONTRACTS = 'contracts',
	ASSETS = 'assets',
	TOKENS = 'tokens',
	OPERATIONS = 'operations',
}

interface GetHistoryParameters {
	[KEY.FROM]?: AccountId[];
	[KEY.TO]?: AccountId[];
	[KEY.ACCOUNTS]?: AccountId[];
	[KEY.CONTRACTS]?: ContractId[];
	[KEY.ASSETS]?: AssetId[];
	[KEY.TOKENS]?: ContractId[];
	[KEY.OPERATIONS]?: ECHO.OPERATION_ID[];
}

type Query = { [x: string]: Query[] | { $in: (ECHO.OPERATION_ID | string)[] } | { $or: Query[] } };

export default class OperationService {

	constructor(
		readonly operationRepository: OperationRepository,
	) {}

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

		if (params.contracts) otherQuery.push({ '_relation.contract': { $in: params.contracts } });
		if (params.assets) otherQuery.push({ '_relation.assets': { $in: params.assets } });
		if (params.tokens) otherQuery.push({ '_relation.token': { $in: params.tokens } });

		if (accountsQuery.length && otherQuery.length) {
			query.$and = [{ $or: accountsQuery }, { $or: otherQuery }];
		} else {
			if (accountsQuery.length) query.$or = accountsQuery;
			if (otherQuery.length) query.$or = otherQuery;
		}

		const [items, total] = await Promise.all([
			this.operationRepository.find(query, null, { skip: offset, limit: count }),
			this.operationRepository.count(query),
		]);
		return { total, items };
	}

}
