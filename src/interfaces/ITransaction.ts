import { Document } from 'mongoose';

export interface ITransaction {
	ref_block_num: number;
	ref_block_prefix: number;
	expiration: string;
	operations: unknown[];
	extensions: unknown;
	signatures: string[];
}

export interface ITransactionDocument extends ITransaction, Document {}
