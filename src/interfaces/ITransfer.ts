import * as BALANCE from '../constants/balance.constants';
import { MongoId } from '../types/mongoose';

export interface IMemo {
	from: string;
	to: string;
	nonce: string;
	message: string;
}

interface IBasicTransfer {
	_from: MongoId;
	_to: MongoId;
	type: BALANCE.TYPE;
	amount: string;
	memo?: IMemo;
}

export interface ITransferAsset extends IBasicTransfer {
	_asset: MongoId;
	type: BALANCE.TYPE.ASSET;
}

export interface ITransferToken extends IBasicTransfer {
	_contract: MongoId;
	type: BALANCE.TYPE.TOKEN;
}

type Transfer = {
	[BALANCE.TYPE.ASSET]: ITransferAsset;
	[BALANCE.TYPE.TOKEN]: ITransferToken;
};

export type ITransfer<T extends BALANCE.TYPE = BALANCE.TYPE> = Transfer[T];
