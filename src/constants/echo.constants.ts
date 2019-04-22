import { AccountId, AssetId } from '../types/echo';

export const CORE_ASSET = '1.3.0'; // ECHO

export enum OPERATION_ID {
	TRANSFER = 0,
	ACCOUNT_CREATE = 5,
	ACCOUNT_UPDATE = 6,
	ACCOUNT_WHITELIST = 7,
	ACCOUNT_UPGRADE = 8,
	ACCOUNT_TRANSFER = 9,
	ASSET_CREATE = 10,
	ASSET_UPDATE = 11,
	ASSET_BITASSET_UPDATE = 12,
	ASSET_UPDATE_FEED_PRODUCERS = 13,
	ASSET_ISSUE = 14,
	ASSET_RESERVE = 15,
	ASSET_FUND_FEE_POOL = 16,
	ASSET_SETTLE = 17,
	ASSET_PUBLISH_FEED = 19,
	ASSET_SETTLE_CANCEL = 42,
	ASSET_CLAIM_FEES = 43,
	CONTRACT_CREATE = 47,
	CONTRACT_CALL = 48,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TranfserOperation;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_TRANSFER]: AccountTransferOperation;
	[OPERATION_ID.ACCOUNT_UPGRADE]: AccountUpgradeOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
	[OPERATION_ID.ASSET_CREATE]: AssetCreateOperation;
	[OPERATION_ID.ASSET_UPDATE]: AssetUpdateOperation;
	[OPERATION_ID.ASSET_BITASSET_UPDATE]: AssetBitAssetUpdateOperation;
	[OPERATION_ID.ASSET_ISSUE]: AssetIssueOperation;
	[OPERATION_ID.ASSET_RESERVE]: AssetReserveOperation;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: AssetFundFeePoolOperation;
	[OPERATION_ID.ASSET_SETTLE]: AssetSettleOperation;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: AssetPublishFeed;
	[OPERATION_ID.ASSET_SETTLE_CANCEL]: AssetSettleCancelOperation;
	[OPERATION_ID.ASSET_CLAIM_FEES]: AssetClaimFeesOperation;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: AssetUpdateFeedProducers;
	[OPERATION_ID.CONTRACT_CREATE]: ContractCreateOperation;
	[OPERATION_ID.CONTRACT_CALL]: ContractCallOperation;
};

export type OperationsResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_UPGRADE]: unknown;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
	[OPERATION_ID.ASSET_CREATE]: string;
	[OPERATION_ID.ASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_BITASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_ISSUE]: unknown;
	[OPERATION_ID.ASSET_RESERVE]: unknown;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: unknown;
	[OPERATION_ID.ASSET_SETTLE]: unknown;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: unknown;
	[OPERATION_ID.ASSET_SETTLE_CANCEL]: unknown;
	[OPERATION_ID.ASSET_CLAIM_FEES]: unknown;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: unknown;
	[OPERATION_ID.CONTRACT_CREATE]: string;
	[OPERATION_ID.CONTRACT_CALL]: unknown;
};

export type OPERATION_PROPS = { [x in OPERATION_ID]: Operations[x] };
export type OPERATION_RESULT = { [x in OPERATION_ID]: OperationsResult[x] };
// export type OPERATION_RESULT<T extends OPERATION_ID> = Operations[T];

export type Authority = [number, {}];
type AssetMarket = unknown[];
type ExtensionsArr = unknown[];
type ExtensionsObj = {};

export interface IAmount {
	amount: number | string;
	asset_id: AssetId;
}

interface TranfserOperation {
	fee: IAmount;
	from: string;
	to: string;
	amount: IAmount;
	extensions: ExtensionsArr;
	memo?: {
		from: string;
		to: string;
		nonce: string;
		message: string;
	};
}

export interface AccountPerson {
	weight_threshold: number;
	account_auths: unknown[];
	key_auths: unknown[][];
	address_auths: unknown[];
}

export interface AccountOptions {
	memo_key: string;
	voting_account: string;
	delegating_account: string;
	num_witness: number;
	num_committee: number;
	votes: unknown[];
	extensions: ExtensionsArr;
}

interface AccountCreateOperation {
	fee: IAmount;
	registrar: string;
	referrer: string;
	referrer_percent: number;
	name: string;
	owner: AccountPerson;
	active: AccountPerson;
	options: AccountOptions;
	extensions: ExtensionsObj;
	ed_key: string;
	owner_special_authority?: Authority;
	active_special_authority?: Authority;
	buyback_options?: unknown;
}

interface AccountUpdateOperation {
	fee: IAmount;
	account: string;
	owner?: AccountPerson;
	active?: AccountPerson;
	ed_key?: string;
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

interface AccountUpgradeOperation {
	fee: IAmount;
	account_to_upgrade: AccountId;
	upgrade_to_lifetime_member: boolean;
}

interface AssetPriceSchema {
	base: IAmount;
	quote: IAmount;
}
export interface AssetOptions {
	max_supply: string;
	market_fee_percent: number;
	max_market_fee: string;
	issuer_permissions: number;
	flags: number;
	core_exchange_rate: AssetPriceSchema;
	whitelist_authorities: Authority;
	blacklist_authorities: Authority;
	whitelist_markets: AssetMarket;
	blacklist_markets: AssetMarket;
	description: string;
	extensions: ExtensionsArr;
}

export interface BitassetOpts {
	short_backing_asset: string;
	maximum_force_settlement_volume: number;
	force_settlement_offset_percent: number;
	force_settlement_delay_sec: number;
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
	is_prediction_market: boolean;
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
		settlement_price: AssetPriceSchema;
		maintenance_collateral_ratio: number | string;
		maximum_short_squeeze_ratio: number | string;
		core_exchange_rate: AssetPriceSchema;
	};
	extensions: ExtensionsArr;
}

interface AssetSettleCancelOperation {
	fee: IAmount;
	settlement: string;
	account: AccountId;
	amount: IAmount;
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

interface AssetSettleOperation {
	fee: IAmount;
	account: AccountId;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface AccountUpgradeOperation {
	fee: IAmount;
	account_to_upgrade: AccountId;
	upgrade_to_lifetime_member: boolean;
}

interface ContractCreateOperation {
	fee: IAmount;
	registrar: string;
	value: IAmount;
	code: string;
	supported_asset_id?: string;
	eth_accuracy: true;
}

interface ContractCallOperation {
	fee: IAmount;
	registrar: string;
	value: IAmount;
	code: string;
	callee: string;
}
