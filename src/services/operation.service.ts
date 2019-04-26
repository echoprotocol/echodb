import OperationRepository from '../repositories/operation.repository';
import * as ECHO from '../constants/echo.constants';
import { AccountId, ContractId, AssetId } from 'types/echo';
import { IOperationRelation } from '../interfaces/IOperation';

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

type InSelect<T = string> = { $in: T[] };
type Query = { [x: string]: Query[] | { $in: (ECHO.OPERATION_ID | string)[] } };
type OrKeys = 'from' | 'accounts' | 'to';
type StrictRelationQuery = Partial<Record<OrKeys, InSelect>>;
type RelationQuery = Partial<Record<Exclude<keyof IOperationRelation, OrKeys>, InSelect>>;

export default class OperationService {

	constructor(
		readonly operationRepository: OperationRepository,
	) {}

	async getHistory(count: number, offset: number, params: GetHistoryParameters) {
		const query: Query = {};
		const relation: RelationQuery = {};
		const strictRelation: StrictRelationQuery = {};

		if (params.from) strictRelation.from = { $in: params.from };
		if (params.to) strictRelation.to = { $in: params.to };
		if (params.accounts) strictRelation.accounts = { $in: params.accounts };

		if (params.contracts) relation.contract = { $in: params.contracts };
		if (params.assets) relation.assets = { $in: params.assets };
		if (params.tokens) relation.token = { $in: params.tokens };

		if (params.operations) query.id = { $in: params.operations };

		for (const key of Object.keys(strictRelation) as (keyof typeof strictRelation)[]) {
			query[`_relation.${key}`] = strictRelation[key];
		}

		const relationKeys = <(keyof typeof relation)[]>Object.keys(relation);
		if (relationKeys.length) {
			query.$or = [];
			for (const key of relationKeys) {
				query.$or.push({ [`_relation.${key}`]: relation[key] });
			}
		}
		const [items, total] = await Promise.all([
			this.operationRepository.find(query, null, { skip: offset, limit: count }),
			this.operationRepository.count(query),
		]);
		return { total, items };
	}

}
