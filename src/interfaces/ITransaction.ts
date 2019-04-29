import { MongoId, TDoc } from '../types/mongoose';
import { IBlock } from './IBlock';

export interface ITransaction {
	_block: MongoId;
	ref_block_num: number;
	ref_block_prefix: number;
	expiration: string;
	extensions: unknown;
	signatures: string[];
}

export interface ITransactionExtended {
	_block: TDoc<IBlock>;
	ref_block_num: number;
	ref_block_prefix: number;
	expiration: string;
	extensions: unknown;
	signatures: string[];
}
