import * as ECHO from '../constants/echo.constants';
import { AccountId, AssetId, ContractId } from '../types/echo';
import { MongoId } from '../types/mongoose';

export type IOperation<T extends ECHO.OPERATION_ID = ECHO.OPERATION_ID> = {
	id: T;
	body: T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_PROPS<T> : unknown;
	result: T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<T> : unknown;
	_tx: MongoId;
	_relation: IOperationRelation | {};
};

// TODO: add block or tx
export interface IOperationRelation {
	from: AccountId[];
	to: AccountId;
	accounts: AccountId[];
	contract: ContractId;
	assets: AssetId[];
	token: ContractId;
}
