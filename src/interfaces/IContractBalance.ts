import { AssetId } from '../types/echo';
import { MongoId } from '../types/mongoose';

export interface IContractBalance {
	_contract: MongoId;
	asset: AssetId;
	amount: string;
}
