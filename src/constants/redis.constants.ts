import * as ECHO from './echo.constants';
import { AccountId } from 'types/echo';
import { IAccountDocument } from '../interfaces/IAccount';
import { IBlockDocument } from '../interfaces/IBlock';
import { IContractDocument } from '../interfaces/IContract';
import { IOperationDocument } from '../interfaces/IOperation';
import { ITransactionDocument } from '../interfaces/ITransaction';

export enum EVENT {
	NEW_BLOCK = 'new_block',
	NEW_TRANSACTION = 'new_transaction',
	NEW_OPERATION = 'new_operation',
	NEW_ACCOUNT = 'new_account',
	NEW_CONTRACT = 'new_contract',
	ACCOUNT_UPDATED = 'account_updated',
	ACCOUNT_OWNER_CHANGED = 'account_owner_changed',
}

export const EVENT_LIST = Object.values(EVENT);

// FIXME: use IBlock ?
export type EVENT_PAYLOAD_TYPE = {
	[EVENT.NEW_BLOCK]: IBlockDocument;
	[EVENT.NEW_TRANSACTION]: ITransactionDocument;
	[EVENT.NEW_OPERATION]: IOperationDocument<ECHO.OPERATION_ID>;
	[EVENT.NEW_ACCOUNT]: IAccountDocument;
	[EVENT.NEW_CONTRACT]: IContractDocument;
	[EVENT.ACCOUNT_UPDATED]: AccountId;
	[EVENT.ACCOUNT_OWNER_CHANGED]: { old: AccountId, new: AccountId };
};

export enum KEY {
	TEST = 'test',
}

export type  KEY_VALUE_TYPE = {
	[KEY.TEST]: string;
};

export enum CLIENT_ID {
	SUB,
	PUB,
	INFO,
}
