import * as CONTRACT from '../constants/contract.constants';
import { MongoId } from '../types/mongoose';

export interface ITokenInfo {
	total_supply: string;
	name: string;
	symbol: string;
	decimals: string;
	holders_count: number;
	transactions_count: number;
}

export interface IContract {
	id: string;
	_registrar: MongoId;
	eth_accuracy: boolean;
	supported_asset_id: string;
	type: CONTRACT.TYPE;
	token_info?: ITokenInfo;
	_block: MongoId;
	problem: boolean;
}
