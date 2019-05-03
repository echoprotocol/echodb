import * as BALANCE from '../constants/balance.constants';
import { MongoId, TDoc } from '../types/mongoose';
import { IAccount } from './IAccount';
import { IContract } from './IContract';
import { IAsset } from './IAsset';

// common
interface IBasic {
	_account: MongoId<IAccount>;
	type: BALANCE.TYPE;
	amount: string;
}

// asset
export interface IBalanceAsset extends IBasic {
	_asset: MongoId<IAsset>;
	type: BALANCE.TYPE.ASSET;
}

export interface IBalanceAssetExtended extends IBalanceAsset {
	_account: TDoc<IAccount>;
	_asset: TDoc<IAsset>;
}

// tokens
export interface IBalanceToken extends IBasic {
	_contract: MongoId<IContract>;
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
