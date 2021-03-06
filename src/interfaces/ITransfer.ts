import * as BALANCE from '../constants/balance.constants';
import * as TRANSFER from '../constants/transfer.constants';
import { MongoId, TDoc } from '../types/mongoose';
import { IAccount } from './IAccount';
import { IContract } from './IContract';
import { IAsset } from './IAsset';
import { IAmount } from 'constants/echo.constants';

interface IBasic {
	_fromAccount?: MongoId;
	_fromContract?: MongoId;
	_toAccount?: MongoId;
	_toContract?: MongoId;
	relationType: TRANSFER.TYPE;
	valueType: BALANCE.TYPE;
	amount: string;
	timestamp: Date;
	block: number;
	trx_in_block: number;
	op_in_trx: number;
	virtual: boolean;
	operationId: number;
	fee: IAmount;
}

// asset
export interface ITransferAsset extends IBasic {
	_asset: MongoId;
	valueType: BALANCE.TYPE.ASSET;
}

export interface ITransferAssetExtended extends ITransferAsset {
	_fromAccount?: TDoc<IAccount>;
	_fromContract?: TDoc<IContract>;
	_toAccount?: TDoc<IAccount>;
	_toContract?: TDoc<IContract>;
	_asset: TDoc<IAsset>;
}

// tokens
export interface ITransferToken extends IBasic {
	_contract: MongoId;
	valueType: BALANCE.TYPE.TOKEN;
}

export interface ITransferTokenExtended extends ITransferToken {
	_fromAccount?: TDoc<IAccount>;
	_fromContract?: TDoc<IContract>;
	_toAccount?: TDoc<IAccount>;
	_toContract?: TDoc<IContract>;
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

export type ITransferWithoutParticipants =
	Exclude<ITransfer, '_fromAccount' | '_fromContract' | '_toAccount' | '_toContract'>;
