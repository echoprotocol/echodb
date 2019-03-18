declare module 'echojs-lib' {
	declare type ConnectionOptions = {};

	class Cache {
		isUsed: boolean = true;
	}

	class WSAPI {}

	type OperationResult = [any, any];

	export interface Account {
		id: string;
		membership_expiration_date: string;
		registrar: string;
		referrer: string;
		lifetime_referrer: string;
		network_fee_percentage: number;
		lifetime_referrer_fee_percentage: number;
		referrer_rewards_percentage: number;
		name: string;
		owner: {
			weight_threshold: number;
			account_auths: unknown[];
			key_auths: unknown[][];
		   address_auths: unknown[];
		};
		active: {
			weight_threshold: number;
			account_auths: unknown[];
			key_auths: unknown[][];
		   address_auths: unknown[];
		};
		ed_key: string;
		options: {
			 memo_key: string;
			voting_account: string;
			delegating_account: string;
			num_witness: number;
			num_committee: number;
			votes: unknown[];
		   extensions: unknown[];
		};
		statistics: string;
		whitelisting_accounts: unknown[];
		blacklisting_accounts: unknown[];
		whitelisted_accounts: unknown[];
		blacklisted_accounts: unknown[];
		cashback_vb: string;
		owner_special_authority: [number, {}];
		active_special_authority: [number, {}];
		top_n_control_flags: number;
	}

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
		operations: any[];
		extensions: unknown[];
		signatures: string[];
		operation_results: OperationResult[];
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

	export interface ContractResult {
		exec_res: {
			excepted: 'None' | unknown;
			new_address: string;
			output: string;
			code_deposit: 'None' | unknown;
			gas_refunded: number;
			gas_for_deposit: number;
			deposit_size: number;
		};
		tr_receipt: {
			status_code: number;
			gas_used: number;
			bloom: string;
			log: unknown[];
		};
	}

	class API {
		constructor(cache: Cache, wsApi: WSAPI);
		getObjects(objectIds: string[], force = false): Promise<object[]>;
		async getObject(objectId: string, force = false): object;
		// getBitAssetData
		// getDynamicAssetData
		getBlockHeader(blockNum: number): Promise<BlockHeader>;
		getBlock(blockNum: number, force: boolean = false): Promise<Block>;
		getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
		getAccounts(ids: string[]): Promise<Account[]>;
		getContractResult(resultId: string): Promise<[number, ContractResult]>;
	}

	export class Subscriber {
		setBlockApplySubscribe(cb: (block: Block) => void): void;
	}

	export { PrivateKey  } from 'echojs-lib';

	export class Echo {
		api?: API;
		cache?: Cache;
		subscriber?: Subscriber;
		get isConnected(): boolean;
		async connect(address: string, options: ConnectionOptions = {}): void;
		async reconnect(): void;
		async disconnect(): void;
		createTransaction(): import('echojs-lib/types').Transaction;
	}

	export default new Echo();

}
