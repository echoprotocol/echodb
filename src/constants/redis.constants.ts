import * as ECHO from './echo.constants';
import { AccountId } from 'types/echo';
import { IAssetDocument } from '../interfaces/IAsset';
import { IAccountDocument } from '../interfaces/IAccount';
import { IBalanceTokenDocument } from 'interfaces/IBalance';
import { IBlockDocument } from '../interfaces/IBlock';
import { IContractDocument } from '../interfaces/IContract';
import { IOperationDocument } from '../interfaces/IOperation';
import { ITransactionDocument } from '../interfaces/ITransaction';

export enum EVENT {
	NEW_ASSET = 'new_asset',
	ASSET_UPDATED = 'asset_updated',
	NEW_ACCOUNT = 'new_account',
	NEW_BLOCK = 'new_block',
	NEW_BALANCE = 'new_balance',
	NEW_TRANSACTION = 'new_transaction',
	NEW_OPERATION = 'new_operation',
	NEW_CONTRACT = 'new_contract',
	ACCOUNT_UPDATED = 'account_updated',
	ACCOUNT_OWNER_CHANGED = 'account_owner_changed',
	BALANCE_UPDATED = 'balance_updated',
}

export const EVENT_LIST = Object.values(EVENT);

// FIXME: use IBlock ?
export type EVENT_PAYLOAD_TYPE = {
	[EVENT.NEW_ASSET]: IAssetDocument;
	[EVENT.NEW_BLOCK]: IBlockDocument;
	[EVENT.NEW_TRANSACTION]: ITransactionDocument;
	[EVENT.NEW_OPERATION]: IOperationDocument<ECHO.OPERATION_ID>;
	[EVENT.ACCOUNT_UPDATED]: string; // account id
	[EVENT.ASSET_UPDATED]: string; // asset id
	[EVENT.ACCOUNT_OWNER_CHANGED]: { old: string, new: string };
	[EVENT.NEW_ACCOUNT]: IAccountDocument;
	[EVENT.NEW_BALANCE]: IBalanceTokenDocument;
	[EVENT.NEW_CONTRACT]: IContractDocument;
	[EVENT.ACCOUNT_UPDATED]: AccountId;
	[EVENT.ACCOUNT_OWNER_CHANGED]: { old: AccountId, new: AccountId };
	[EVENT.BALANCE_UPDATED]: IBalanceTokenDocument;
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
