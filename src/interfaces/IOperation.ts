import * as ECHO from '../constants/echo.constants';
import { AccountId, AssetId, ContractId } from '../types/echo';
import { MongoId } from '../types/mongoose';

export type IOperation<T extends ECHO.OPERATION_ID = ECHO.OPERATION_ID> = {
	id: T;
	body: T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_PROPS<T> : unknown;
	result: T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<T> : unknown;
	block: MongoId;
	virtual: boolean;
	_tx: MongoId;
	timestamp: Date;
	_relation: IOperationRelation | null;
	op_in_trx: number;
	trx_in_block: number;
	trx_hex?: string;
	vop_index: number | null;
	internal_operations_count: number;
};

// TODO: add block or tx
export interface IOperationRelation {
	from: AccountId[] | ContractId[];
	to: AccountId[] | ContractId[];
	accounts: AccountId[];
	contracts: ContractId[];
	assets: AssetId[];
	tokens: ContractId[];
}
