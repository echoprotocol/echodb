import { Document } from 'mongoose';

export interface IBlock {
	fullyParsed: boolean;
	previous: string;
	timestamp: string;
	witness: string;
	account: string;
	transaction_merkle_root: string;
	state_root_hash: string;
	result_root_hash: string;
	extensions: unknown[];
	witness_signature: string;
	ed_signature: string;
	verifications: unknown[];
	round: number;
	rand: string;
	cert: {
		_rand: string;
		_block_hash: string;
		_producer: number;
		_signatures: {
			_step: number;
			_value: number;
			_signer: number;
			_bba_sign: string;
		}[];
	};
}

export interface IBlockDocument extends IBlock, Document {}
