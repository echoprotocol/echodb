import * as BALANCE from '../constants/balance.constants';
import { Document } from 'mongoose';
import { MongoId } from '../types/mongoose';

interface IBasicBalance {
	_account: MongoId;
	type: BALANCE.TYPE;
	amount: string;
}

export interface IBalanceAssetDocument extends IBalanceAsset, Document {}
export interface IBalanceAsset extends IBasicBalance {
	asset: string;
	type: BALANCE.TYPE.ASSET;
}

export interface IBalanceTokenDocument extends IBalanceToken, Document {}
export interface IBalanceToken extends IBasicBalance {
	_contract: MongoId;
	type: BALANCE.TYPE.TOKEN;
}

type Balance = {
	[BALANCE.TYPE.ASSET]: IBalanceAsset;
	[BALANCE.TYPE.TOKEN]: IBalanceToken;
};

export type IBalance<T extends BALANCE.TYPE> = Balance[T];
export type IBalanceDocument = IBalanceAssetDocument | IBalanceTokenDocument;
