import { IBlockDocument } from '../interfaces/IBlock';
import { IOperationDocument } from 'interfaces/IOperation';
import * as ECHO from './echo.constants';
import { ITransactionDocument } from 'interfaces/ITransaction';

export enum EVENT {
	NEW_BLOCK,
	NEW_TRANSACTION,
	NEW_OPERATION,
}

// FIXME: use IBlock
export type EVENT_PAYLOAD_TYPE = {
	[EVENT.NEW_BLOCK]: IBlockDocument;
	[EVENT.NEW_TRANSACTION]: ITransactionDocument;
	[EVENT.NEW_OPERATION]: IOperationDocument<ECHO.OPERATION_ID>;
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
