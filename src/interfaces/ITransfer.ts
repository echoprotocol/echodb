import * as BALANCE from '../constants/balance.constants';
import { MongoId, TDoc } from '../types/mongoose';
import { IAccount } from './IAccount';
import { IContract } from './IContract';
import { IAsset } from './IAsset';

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

export interface ITransferAssetExtended extends ITransferAsset {
	_from: TDoc<IAccount>;
	_to: TDoc<IAccount>;
	_asset: TDoc<IAsset>;
}

// tokens
export interface ITransferToken extends IBasicTransfer {
	_contract: MongoId;
	type: BALANCE.TYPE.TOKEN;
}

export interface ITransferTokenExtended extends ITransferToken {
	_from: TDoc<IAccount>;
	_to: TDoc<IAccount>;
	_contract: TDoc<IContract>;
}

// common
type Transfer = {
	[BALANCE.TYPE.ASSET]: ITransferAsset;
	[BALANCE.TYPE.TOKEN]: ITransferToken;
};

type Extended = {
	[BALANCE.TYPE.ASSET]: ITransferAssetExtended;
	[BALANCE.TYPE.TOKEN]: ITransferTokenExtended;
};

export type ITransfer<T extends BALANCE.TYPE = BALANCE.TYPE> = Transfer[T];
export type ITransferExtended<T extends BALANCE.TYPE = BALANCE.TYPE> = Extended[T];
