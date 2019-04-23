import * as BALANCE from '../constants/balance.constants';
import { MongoId, TDoc } from '../types/mongoose';
import { IAccount } from './IAccount';
import { IContract } from './IContract';

// common
interface IBasic {
	_account: MongoId;
	type: BALANCE.TYPE;
	amount: string;
}

// asset
export interface IBalanceAsset extends IBasic {
	_asset: MongoId;
	type: BALANCE.TYPE.ASSET;
}

export interface IBalanceAssetExtended extends IBalanceAsset {
	_account: TDoc<IAccount>;
}

// tokens
export interface IBalanceToken extends IBasic {
	_contract: MongoId;
	type: BALANCE.TYPE.TOKEN;
}

export interface IBalanceTokenExtended extends IBalanceToken {
	_account: TDoc<IAccount>;
	_contract: TDoc<IContract>;
}

// common
type Balance = {
	[BALANCE.TYPE.ASSET]: IBalanceAsset;
	[BALANCE.TYPE.TOKEN]: IBalanceToken;
};
export type IBalance<T extends BALANCE.TYPE = BALANCE.TYPE> = Balance[T];

type Extended = {
	[BALANCE.TYPE.ASSET]: IBalanceAssetExtended;
	[BALANCE.TYPE.TOKEN]: IBalanceTokenExtended;
};

export type IBalanceExtended<T extends BALANCE.TYPE = BALANCE.TYPE> = Extended[T];
