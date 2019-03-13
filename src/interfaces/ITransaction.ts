import { Document } from 'mongoose';
import { MongoId } from '../types/mongoose';

export interface ITransaction {
	_block: MongoId;
	ref_block_num: number;
	ref_block_prefix: number;
	expiration: string;
	extensions: unknown;
	signatures: string[];
}

export interface ITransactionDocument extends ITransaction, Document {}
