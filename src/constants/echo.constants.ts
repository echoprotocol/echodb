import { AccountId, AssetId, ContractResultId } from '../types/echo';
export const CORE_ASSET = '1.3.0';

export const CONNECT_STATUS = 'connect';

export enum OPERATION_ID {
	TRANSFER,
	ACCOUNT_CREATE,
	ACCOUNT_UPDATE,
	ACCOUNT_WHITELIST,
	ACCOUNT_TRANSFER,
	ASSET_CREATE,
	ASSET_UPDATE,
	ASSET_BITASSET_UPDATE,
	ASSET_UPDATE_FEED_PRODUCERS,
	ASSET_ISSUE,
	ASSET_RESERVE,
	ASSET_FUND_FEE_POOL,
	ASSET_PUBLISH_FEED,
	PROPOSAL_CREATE,
	PROPOSAL_UPDATE,
	PROPOSAL_DELETE,
	COMMITTEE_MEMBER_CREATE,
	COMMITTEE_MEMBER_UPDATE,
	COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS,
	VESTING_BALANCE_CREATE,
	VESTING_BALANCE_WITHDRAW,
	BALANCE_CLAIM,
	OVERRIDE_TRANSFER,
	ASSET_CLAIM_FEES,
	CONTRACT_CREATE,
	CONTRACT_CALL,
	CONTRACT_TRANSFER,
	SIDECHAIN_CHANGE_CONFIG, // temporary operation for tests
	ACCOUNT_ADDRESS_CREATE,
	TRANSFER_TO_ADDRESS,
	SIDECHAIN_ETH_CREATE_ADDRESS,
	SIDECHAIN_ETH_APPROVE_ADDRESS,
	SIDECHAIN_ETH_DEPOSIT,
	SIDECHAIN_ETH_WITHDRAW,
	SIDECHAIN_ETH_APPROVE_WITHDRAW,
	CONTRACT_FUND_POOL,
	CONTRACT_WHITELIST,
	CONTRACT_ISSUE,
	CONTRACT_BURN,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TransferOperation;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_TRANSFER]: AccountTransferOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
	[OPERATION_ID.ASSET_CREATE]: AssetCreateOperation;
	[OPERATION_ID.ASSET_UPDATE]: AssetUpdateOperation;
	[OPERATION_ID.ASSET_BITASSET_UPDATE]: AssetBitAssetUpdateOperation;
	[OPERATION_ID.ASSET_ISSUE]: AssetIssueOperation;
	[OPERATION_ID.ASSET_RESERVE]: AssetReserveOperation;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: AssetFundFeePoolOperation;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: AssetPublishFeed;
	[OPERATION_ID.ASSET_CLAIM_FEES]: AssetClaimFeesOperation;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: AssetUpdateFeedProducers;
	[OPERATION_ID.CONTRACT_CREATE]: ContractCreateOperation;
	[OPERATION_ID.CONTRACT_CALL]: ContractCallOperation;
	[OPERATION_ID.CONTRACT_TRANSFER]: ContractTransferOperation;
	[OPERATION_ID.VESTING_BALANCE_CREATE]: VestingBalanceCreate;
	[OPERATION_ID.VESTING_BALANCE_WITHDRAW]: VestingBalanceWithdraw;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS]: CommitteeMemberUpdateGlobalParametersProps
	[OPERATION_ID.BALANCE_CLAIM]: BalanceClaimOperation;
	[OPERATION_ID.OVERRIDE_TRANSFER]: OverrideTransfer;
};

export type OperationResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
	[OPERATION_ID.ASSET_CREATE]: string;
	[OPERATION_ID.ASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_BITASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_ISSUE]: unknown;
	[OPERATION_ID.ASSET_RESERVE]: unknown;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: unknown;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: unknown;
	[OPERATION_ID.ASSET_CLAIM_FEES]: unknown;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: unknown;
	[OPERATION_ID.CONTRACT_CREATE]: string;
	[OPERATION_ID.CONTRACT_CALL]: ContractResultId;
	[OPERATION_ID.CONTRACT_TRANSFER]: unknown;
	[OPERATION_ID.VESTING_BALANCE_CREATE]: unknown;
	[OPERATION_ID.VESTING_BALANCE_WITHDRAW]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS]: unknown;
	[OPERATION_ID.BALANCE_CLAIM]: unknown;
	[OPERATION_ID.OVERRIDE_TRANSFER]: unknown;
};

export type KNOWN_OPERATION = Extract<keyof Operations, OPERATION_ID>;

export type OPERATION_PROPS<T extends keyof Operations> = Operations[T];
export type OPERATION_RESULT<T extends keyof OperationResult> = OperationResult[T];

export type Authority = [number, {}];
type ExtensionsArr = unknown[];
type ExtensionsObj = {};

export interface IAmount {
	amount: number | string;
	asset_id: AssetId;
}

interface TransferOperation {
	fee: IAmount;
	from: string;
	to: string;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface ContractTransferOperation {
	fee: IAmount;
	from: string;
	to: string;
	amount: IAmount;
}

export interface AccountPerson {
	weight_threshold: number;
	account_auths: unknown[];
	key_auths: unknown[][];
	address_auths: unknown[];
}

export interface AccountOptions {
	voting_account: string;
	delegating_account: string;
	num_committee: number;
	votes: unknown[];
	extensions: ExtensionsArr;
}

interface AccountCreateOperation {
	fee: IAmount;
	registrar: string;
	name: string;
	owner: AccountPerson;
	active: AccountPerson;
	options: AccountOptions;
	extensions: ExtensionsObj;
	echorand_key: string;
	owner_special_authority?: Authority;
	active_special_authority?: Authority;
}

interface AccountUpdateOperation {
	fee: IAmount;
	account: string;
	owner?: AccountPerson;
	active?: AccountPerson;
	echorand_key?: string;
	new_options?: AccountOptions;
	owner_special_authority?: Authority;
	active_special_authority?: Authority;
	extensions: ExtensionsObj;
}

interface AccountTransferOperation {
	fee: IAmount;
	account_id: string;
	new_owner: string;
	extensions: ExtensionsArr;
}

export enum ACCOUNT_WHITELIST {
	NO_LISTING,
	WHITE_LISTED,
	BLACK_LISTED,
	WHITE_AND_BLACK_LISTED,
}

interface AccountWhitelistOperation {
	fee: IAmount;
	authorizing_account: string;
	account_to_list: string;
	new_listing: ACCOUNT_WHITELIST;
	extensions: ExtensionsArr;
}
interface AssetPriceSchema {
	base: {
		amount: number;
		asset_id: string;
	};
	quote: {
		amount: number;
		asset_id: string;
	};
}

export interface BitassetOpts {
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
		settlement_price: AssetPriceSchema;
		core_exchange_rate: AssetPriceSchema;
	};
	settlement_price: AssetPriceSchema;
}

export interface IAssetPrice {
	base: IAmount;
	quote: IAmount;
}

export interface AssetOptions {
	max_supply: string;
	issuer_permissions: number;
	flags: number;
	core_exchange_rate: IAssetPrice;
	whitelist_authorities: Authority;
	blacklist_authorities: Authority;
	description: string;
	extensions: ExtensionsArr;
}

export interface BitassetOpts {
	short_backing_asset: string;
	feed_lifetime_sec: number;
	minimum_feeds: number;
}

interface AssetCreateOperation {
	fee: IAmount;
	issuer: string;
	symbol: string;
	precision: number;
	common_options: AssetOptions;
	bitasset_opts: BitassetOpts;
	extensions: ExtensionsArr;
}

interface AssetUpdateOperation {
	fee: IAmount;
	issuer: string;
	asset_to_update: string;
	new_issuer: string;
	new_options: AssetOptions;
	extensions: ExtensionsArr;
}

interface AssetBitAssetUpdateOperation {
	fee: IAmount;
	issuer: string;
	asset_to_update: string;
	new_options: BitassetOpts;
}

interface AssetIssueOperation {
	fee: IAmount;
	issuer: AccountId;
	asset_to_issue: IAmount;
	issue_to_account: AccountId;
	extensions: ExtensionsArr;
}

interface AssetReserveOperation {
	fee: IAmount;
	payer: AccountId;
	amount_to_reserve: IAmount;
	extensions: ExtensionsArr;
}

interface AssetFundFeePoolOperation {
	fee: IAmount;
	from_account: AccountId;
	asset_id: AssetId;
	amount: string | number;
}

interface AssetPublishFeed {
	fee: IAmount;
	publisher: AccountId;
	asset_id: AssetId;
	feed: {
		settlement_price: IAssetPrice;
		maintenance_collateral_ratio: number | string;
		maximum_short_squeeze_ratio: number | string;
		core_exchange_rate: IAssetPrice;
	};
	extensions: ExtensionsArr;
}

interface AssetClaimFeesOperation {
	fee: IAmount;
	issuer: AccountId;
	amount_to_claim: IAmount;
}

interface AssetUpdateFeedProducers {
	fee: IAmount;
	issuer: AccountId;
	asset_to_update: AssetId;
	new_feed_producers: AccountId[];
}

interface ContractCreateOperation {
	fee: IAmount;
	registrar: string;
	value: IAmount;
	code: string;
	supported_asset_id?: string;
	eth_accuracy: true;
	extensions: ExtensionsArr;
}

interface ContractCallOperation {
	fee: IAmount;
	registrar: string;
	value: IAmount;
	code: string;
	callee: string;
	extensions: ExtensionsArr;
}

export interface IPolicy {
	begin_timestamp: String;
	vesting_cliff_seconds: Number;
	vesting_duration_seconds: Number;
}
interface VestingBalanceCreate{
	fee: IAmount;
	creator: string;
	owner: string;
	amount: IAmount;
	policy: IPolicy;
	extensions: ExtensionsArr;
}

interface VestingBalanceWithdraw {
	fee: IAmount;
	vesting_balance: String;
	owner: string;
	amount: IAmount;
	extensions: ExtensionsArr;
}

export interface IEth {
	method: String;
	gas: Number;
}
export interface INewParameters {
	current_fees: {
		parameters: [];
		scale: Number;
	};
	block_interval: Number;
	maintenance_interval: Number;
	maintenance_duration_seconds: Number;
	committee_proposal_review_period: Number;
	maximum_transaction_size: Number;
	maximum_block_size: Number;
	maximum_time_until_expiration: Number;
	maximum_proposal_lifetime: Number;
	maximum_asset_whitelist_authorities: Number;
	maximum_asset_feed_publishers: Number;
	maximum_committee_count: Number;
	maximum_authority_membership: Number;
	reserve_percent_of_fee: Number;
	network_percent_of_fee: Number;
	max_predicate_opcode: Number;
	accounts_per_fee_scale: Number;
	account_fee_scale_bitshifts: Number;
	max_authority_depth: Number;
	echorand_config: {
		_time_net_1mb: Number;
		_time_net_256b: Number;
		_creator_count: Number;
		_verifier_count: Number;
		_ok_threshold: Number;
		_max_bba_steps: Number;
		_gc1_delay: Number;
	};
	sidechain_config: {
		eth_contract_address: String;
		eth_committee_update_method : IEth;
		eth_gen_address_method : IEth;
		eth_withdraw_method : IEth;
		eth_update_addr_method : IEth;
		eth_withdraw_token_method : IEth;
		eth_collect_tokens_method : IEth;
		eth_committee_updated_topic: String;
		eth_gen_address_topic: String;
		eth_deposit_topic: String;
		eth_withdraw_topic: String;
		erc20_deposit_topic: String;
		ETH_asset_id: String;
		fines : {
			generate_eth_address: Number;
		}
		waiting_blocks: Number;
	};
	erc20_config: {
		contract_code: String;
		create_token_fee: Number;
		transfer_topic: String;
		check_balance_method: IEth;
		burn_method: IEth;
		issue_method: IEth;
	};
	gas_price: {
		price: Number;
		gas_amount: Number;
	};
	extensions: ExtensionsArr;
}
interface CommitteeMemberUpdateGlobalParametersProps{
	fee: IAmount;
	new_parameters: INewParameters;
	extensions: ExtensionsArr;
}

interface BalanceClaimOperation {
	fee: IAmount;
	deposit_to_account: string;
	balance_to_claim: string;
	balance_owner_key: string;
    total_claimed: IAmount;
	extensions: ExtensionsArr;
}

interface OverrideTransfer {
	fee: IAmount;
	issuer: String;
	from: string;
	to: string;
	amount: IAmount;
	extensions: ExtensionsArr;
}