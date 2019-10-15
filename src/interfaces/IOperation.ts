import * as ECHO from '../constants/echo.constants';
import { AccountId, AssetId, ContractId } from '../types/echo';
import { MongoId, TDoc } from '../types/mongoose';
import { IBlock } from './IBlock';

export type IOperation<T extends ECHO.OPERATION_ID = ECHO.OPERATION_ID> = {
	id: T;
	body: T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_PROPS<T> : unknown;
	result: T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<T> : unknown;
	block: TDoc<IBlock>;
	virtual: boolean;
	_tx: MongoId;
	timestamp: Date;
	_relation: IOperationRelation | null;
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
