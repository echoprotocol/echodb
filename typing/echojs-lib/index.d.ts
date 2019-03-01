declare module 'echojs-lib' {
	declare type ConnectionOptions = {};

	export class Transaction {}

	class Cache {}

	class WSAPI {}

	export interface BlockHeader { // virtual export
		previous: string;
		timestamp: string;
		witness: string;
		account: string;
		transaction_merkle_root: string;
		state_root_hash: string;
		result_root_hash: string;
		extensions: unknown[];
	}
	export interface Transaction { // virtual export
		ref_block_num: number;
		ref_block_prefix: number;
		expiration: string;
		operations: unknow[];
		extensions: unknown;
		signatures: string[];
		operation_results: unknown[][];
	}
	export interface Signature { // virtual export
		_step: number;
		_value: number;
		_signer: number;
		_bba_sign: string;
	}
	export interface Block{ // virtual export
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
			_signatures: Signature[];
  		};
  		transactions: Transaction[];
	}
	export interface DynamicGlobalProperties { // virtual export
		id: string;
		head_block_number: number;
		head_block_id: string;
		time: string;
		current_withness: string;
		next_maintenance_time: string;
		last_budget_time: string;
		withness_budget: number;
		accounts_registered_this_interval: number;
		recently_missed_count: number;
		current_aslot: number;
		recent_slots_filled: string;
		dynamic_flags: number;
		last_irreversible_block_num: number;
	}

	class API {
		constructor(cache: Cache, wsApi: WSAPI);
		getObjects(objectIds: string[], force = false): Promise<object[]>;
		async getObject(objectId: string, force = false): object;
		// getBitAssetData
		// getDynamicAssetData
		getBlockHeader(blockNum: number): Promise<BlockHeader>;
		getBlock(blockNum: number): Promise<Block>;
		getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
	}

	export class Subscriber {}

	export class Echo {
		api?: API;
		cache?: Cache;
		subscriber?: Subscriber;
		get isConnected(): boolean;
		async connect(address: string, options: ConnectionOptions = {}): void;
		async reconnect(): void;
		async disconnect(): void;
		createTransaction(): Transaction;
	}

	export default new Echo();

}
