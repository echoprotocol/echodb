import * as BALANCE from '../constants/balance.constants';
import { MongoId, TDoc } from '../types/mongoose';
import { IContract } from './IContract';
import { IAsset } from './IAsset';

export interface IBasic {
	_owner: MongoId<IContract>;
	amount: string;
}

export interface IContractBalanceAsset extends IBasic {
	_asset: MongoId<IAsset>;
	type: BALANCE.TYPE.ASSET;
}

export interface IContractBalanceToken extends IBasic {
	_contract: MongoId<IContract>;
	type: BALANCE.TYPE.TOKEN;
}

type Map = {
	[BALANCE.TYPE.ASSET]: IContractBalanceAsset,
	[BALANCE.TYPE.TOKEN]: IContractBalanceToken,
};

export type IContractBalance<T extends BALANCE.TYPE = BALANCE.TYPE> = Map[T];

// Extended
export interface IContractBalanceAssetExtended extends IContractBalanceAsset {
	_asset: TDoc<IAsset>;
}

export interface IContractBalanceTokenExtended extends IContractBalanceToken {
	_contract: TDoc<IContract>;
}

export interface IExtended {
	_owner: TDoc<IContract>;
}

export type ExtendedMap = {
	[BALANCE.TYPE.ASSET]: IContractBalanceAssetExtended,
	[BALANCE.TYPE.TOKEN]: IContractBalanceTokenExtended,
};

export type IContractBalanceExtended<T extends BALANCE.TYPE = BALANCE.TYPE> = ExtendedMap[T] & IExtended;
