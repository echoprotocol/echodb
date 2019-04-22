import { AssetId } from '../types/echo';
import { MongoId, TDoc } from '../types/mongoose';
import { IContract } from './IContract';

export interface IContractBalance {
	_contract: MongoId;
	asset: AssetId;
	amount: string;
}

export interface IContractBalanceExtended extends IContractBalance {
	_contract: TDoc<IContract>;
}
