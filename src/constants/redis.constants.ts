import { IBlockDocument } from '../interfaces/IBlock';
import { IAssetDocument } from '../interfaces/IAsset';
import { IOperationDocument } from 'interfaces/IOperation';
import * as ECHO from './echo.constants';
import { ITransactionDocument } from 'interfaces/ITransaction';

export enum EVENT {
	NEW_ASSET,
	NEW_BLOCK,
	NEW_TRANSACTION,
	NEW_OPERATION,
	ACCOUNT_UPDATED,
	ASSET_UPDATED,
	ACCOUNT_OWNER_CHANGED,
}

// FIXME: use IBlock
export type EVENT_PAYLOAD_TYPE = {
	[EVENT.NEW_ASSET]: IAssetDocument;
	[EVENT.NEW_BLOCK]: IBlockDocument;
	[EVENT.NEW_TRANSACTION]: ITransactionDocument;
	[EVENT.NEW_OPERATION]: IOperationDocument<ECHO.OPERATION_ID>;
	[EVENT.ACCOUNT_UPDATED]: string; // account id
	[EVENT.ASSET_UPDATED]: string; // asset id
	[EVENT.ACCOUNT_OWNER_CHANGED]: { old: string, new: string };
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
