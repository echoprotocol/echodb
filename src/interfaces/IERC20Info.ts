import { MongoId } from '../types/mongoose';

export interface IERC20Info {
	_contract: MongoId;
	name: string;
	symbol: string;
	totalSupply: string;
}
