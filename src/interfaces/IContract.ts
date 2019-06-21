import * as CONTRACT from '../constants/contract.constants';
import { MongoId } from '../types/mongoose';

export interface ITokenInfo {
	total_supply: string;
	name: string;
	symbol: string;
	decimals: string;
}

export interface IContract {
	id: string;
	_registrar: MongoId;
	eth_accuracy: boolean;
	supported_asset_id: string;
	type: CONTRACT.TYPE;
	token_info?: ITokenInfo;
	_block: MongoId;
	_calling_accounts?: MongoId[];
	problem: boolean;
}
