import OperationRepository from '../repositories/operation.repository';
import * as ECHO from '../constants/echo.constants';
import { SomeOfAny } from '../types/some.of';
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

export default class OperationService {

	constructor(
		readonly operationRepository: OperationRepository,
	) {}

	// TODO: move to repo
	// TODO: remove @ts-ignore
	async getHistory(count: number, offset: number, params: GetHistoryParameters) {
		// FIXME: add types (someOf)
		const query: any = {};
		const relation: SomeOfAny<IOperationRelation> = {};
		for (const key in params) {
			if (!params.hasOwnProperty(key)) continue;
			// @ts-ignore
			if (!params[key]) continue;
			switch (key) {
				case KEY.FROM:
				case KEY.ACCOUNTS:
				case KEY.ASSETS:
					relation[key] = { $all: params[key] };
					break;
				case KEY.TO:
					relation[key] = { $in: params[key] };
				case KEY.CONTRACTS:
					relation.contract = { $in: params[key] };
				case KEY.TOKENS:
					relation.token = { $in: params[key] };
					break;
				case KEY.OPERATIONS:
					query.id = { $in: params[key] };
					break;
			}
		}
		// FIXME: refactor condition logic
		for (const relationKey of Object.keys(relation)) {
			// @ts-ignore
			query[`_relation.${relationKey}`] = relation[relationKey];
		}
		const [items, total] = await Promise.all([
			this.operationRepository.find(query , null, { skip: offset, limit: count }),
			this.operationRepository.count(query),
		]);
		return { total, items };
	}

}
