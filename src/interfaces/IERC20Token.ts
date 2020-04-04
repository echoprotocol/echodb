import { MongoId } from '../types/mongoose';

export default interface IERC20Token {
	id: string;
	owner: MongoId;
	eth_addr: string;
	contract: MongoId;
	name: string;
	symbol: string;
	decimals: number;
}
