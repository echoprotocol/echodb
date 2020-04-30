declare module 'echojs-lib' {
	declare type ConnectionOptions = {};

	class Cache {
		isUsed: boolean = true;
	}

	class WSAPI {}

	type OperationResult = [any, any];

	export interface Account {
		id: string;
		registrar: string;
		network_fee_percentage: number;
		name: string;
		active: {
			weight_threshold: number;
			account_auths: unknown[];
			key_auths: unknown[][];
		   address_auths: unknown[];
		};
		echorand_key: string;
		options: {
			voting_account: string;
			delegating_account: string;
			num_committee: number;
			votes: unknown[];
			extensions: unknown[];
		};
		statistics: string;
		whitelisting_accounts: unknown[];
		blacklisting_accounts: unknown[];
		whitelisted_accounts: unknown[];
		blacklisted_accounts: unknown[];
		owner_special_authority: [number, {}];
		active_special_authority: [number, {}];
		top_n_control_flags: number;
		addresses: string[];
		extensions: unknown[];
	}

	export interface Asset {
		dynamic_asset_data_id: string;
		bitasset: IAssetBitasset;
		bitasset_data_id: string;
	}

	export interface BlockHeader { // virtual export
		previous: string;
		round: number;
		timestamp: string;
		account: string;
		delegate: string;
		transaction_merkle_root: string;
		vm_root: string[];
		state_root_hash: string;
		result_root_hash: string;
		extensions: unknown[];
	}
	export interface Transaction { // virtual export
		ref_block_num: number;
		ref_block_prefix: number;
		expiration: string;
		operations: [number, any][];
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
			_signatures: Signature[];
  		};
  		transactions: Transaction[];
	}
	export interface IAssetBitasset {
		id: string;
		current_feed_publication_time: string;
		force_settled_volume: number;
		settlement_fund: number;
		feeds: unknown[];
		options: {
			short_backing_asset: string;
			feed_lifetime_sec: number;
			minimum_feeds: number;
		};
		current_feed: {
			maintenance_collateral_ratio: number;
			maximum_short_squeeze_ratio: number;
			settlement_price: IAssetPrice;
			core_exchange_rate: IAssetPrice;
		};
		settlement_price: IAssetPrice;
	}
	export interface Asset{ // virtual export
		id: string;
		symbol: string;
		precision: number;
		issuer: string;
		options: {
			max_supply: string;
			issuer_permissions: number;
			flags: number;
			core_exchange_rate: {
				base: {
					amount: number;
					asset_id: string;
				};
				quote: {
					amount: number;
					asset_id: string;
				};
			};
			whitelist_authorities: unknown[];
			blacklist_authorities: unknown[];
			description: string;
		};
		dynamic_asset_data_id: string;
		dynamic: {
			id: string;
			current_supply: string;
			confidential_supply: string;
			accumulated_fees: string;
			fee_pool: string;
		};
		bitasset: IAssetBitasset;
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
		dynamic_flags: number;
		last_irreversible_block_num: number;
		last_rand_quantity: number;
	}

	export interface GlobalProperties {
		id: string;
		parameters: {
			echorand_config: {
				_creator_count: number,
			},
		};
		active_committee_members: string[][];
	}

	export interface ContractResult {
		exec_res: {
			excepted: 'None' | unknown;
			new_address: string;
			output: string;
			code_deposit: 'None' | unknown;
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

	export interface BlockVirtualOperation {
		id: string;
		op: [number, any];
		result: [number, {}];
		block_num: number;
		trx_in_block: number;
		op_in_trx: number;
		virtual_op: number;
	}

	export default interface Committee {
		id: string;
		committee_member_account: string;
		url: string;
		eth_address: string;
		btc_public_key: string;
		last_committee_quit: number;
	}
	export default interface AccountEthAddress {
		id: string;
		account: string;
		eth_addr: string;
		is_approved: boolean;
		approves: any[];
		extensions: any[];
	}

	export type BigNumber = import('echojs-lib/types').BigNumber;
	type IObject = import('echojs-lib/types/interfaces/objects').IObject;
	type Contract = import('echojs-lib/types/interfaces/Contract').Contract;

	class API {
		constructor(cache: Cache, wsApi: WSAPI);
		getObjects(objectIds: string[], force = false): Promise<object[]>;
		async getObject<T extends IObject = IObject>(objectId: string, force = false): Promise<T>;
		async getContract(contractId: string): Promise<Contract | null>;
		// getBitAssetData
		// getDynamicAssetData
		getBlockHeader(blockNum: number): Promise<BlockHeader>;
		getBlock(blockNum: number, force: boolean = false): Promise<Block>;
		getAssets(assets: string[]): Promise<Asset[]>;
		getEthAddress(accountId: string): Promise<AccountEthAddress>;
		getDynamicGlobalProperties(): Promise<DynamicGlobalProperties>;
		getGlobalProperties(): Promise<GlobalProperties>;
		getAccounts(ids: string[]): Promise<Account[]>;
		getAccountCount(): Promise<number>;
		getContractResult(resultId: string): Promise<[number, ContractResult]>;
		getBlockVirtualOperations(blockNum: number): Promise<[BlockVirtualOperation]>;
		getAssets(ids: string[]): Promise<Asset[]>;
		getCommitteeMemberByAccount(accountId: string, force?: boolean): Promise<Committee>;
		callContractNoChangingState(
			contractId: string,
			accountId: string,
			asset: { asset_id: string, amount: number | string | BigNumber },
			bytecode: string,
		): Promise<string>;
	}

	export class Subscriber {
		setGlobalSubscribe(cb: Function): void;
		setStatusSubscribe(status: string, cb: Function): void;
		setBlockApplySubscribe(cb: (block: Block) => void): void;
	}

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

	export type PrivateKey = import('echojs-lib/types').PrivateKey;
	export const validators: typeof import('echojs-lib/types').validators;
	export const constants: typeof import('echojs-lib/types').constants;

	export default new Echo();

	export function decode(hex: string, types: any): any;
	export function encode(_: { value: any, type: string }): string;

}
