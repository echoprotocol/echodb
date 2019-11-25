import { Block, BlockVirtualOperation, Transaction } from 'echojs-lib';

export interface IBlock {
	previous: string;
	timestamp: string;
	account: string;
	delegate: string;
	transaction_merkle_root: string;
	state_root_hash: string;
	result_root_hash: string;
	extensions: unknown[];
	ed_signature: string;
	verifications: unknown[];
	round: number;
	rand: string;
	vm_root: string[];
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

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Operation = Transaction['operations'][0];

export type OperationWithInjectedVirtualOperaitons = [Operation[0], Operation[1] & {
	virtual_operations: BlockVirtualOperation[],
}];

export type TransactionWithInjectedVirtualOperations = Omit<Transaction, 'operations'> & {
	operations: OperationWithInjectedVirtualOperaitons[],
};

export type BlockWithInjectedVirtualOperations = Omit<Block, 'transactions'> & {
	transactions: TransactionWithInjectedVirtualOperations[],
	unlinked_virtual_operations: BlockVirtualOperation[],
};
