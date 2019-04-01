import * as ECHO from '../constants/echo.constants';
import { Document } from 'mongoose';
import { AccountId, AssetId, ContractId } from '../types/echo';
import { MongoId } from '../types/mongoose';

export type IOperation<T extends ECHO.OPERATION_ID> = {
	id: T;
	body: ECHO.OPERATION_PROPS[T];
	result: ECHO.OPERATION_RESULT[T];
	_tx: MongoId;
	_relation: IOperationRelation | {};
};

// @ts-ignore
export interface IOperationDocument<T extends ECHO.OPERATION_ID> extends IOperation<T>, Document {}

// TODO: add block or tx
export interface IOperationRelation {
	from: AccountId[];
	to: AccountId;
	accounts: AccountId[];
	contract: ContractId;
	assets: AssetId[];
	token: ContractId;
}
