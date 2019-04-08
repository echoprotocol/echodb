import { AccountId, AssetId } from './../types/echo/index.d';
export enum ASSET {
	ECHO = '1.3.0',
}

export enum OPERATION_ID {
	TRANSFER = 0,
	ACCOUNT_CREATE = 5,
	ACCOUNT_UPDATE = 6,
	ACCOUNT_WHITELIST = 7,
	ACCOUNT_TRANSFER = 9,
	ASSET_CREATE = 10,
	ASSET_UPDATE = 11,
	ASSET_ISSUE = 14,
	CONTRACT_CREATE = 47,
	CONTRACT_CALL = 48,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TranfserOperation;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_TRANSFER]: AccountTransferOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
	[OPERATION_ID.ASSET_CREATE]: AssetCreateOperation;
	[OPERATION_ID.ASSET_UPDATE]: AssetUpdateOperation;
	[OPERATION_ID.ASSET_ISSUE]: AssetIssueOperation;
	[OPERATION_ID.CONTRACT_CREATE]: ContractCreateOperation;
	[OPERATION_ID.CONTRACT_CALL]: ContractCallOperation;
};

export type OperationsResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
	[OPERATION_ID.ASSET_CREATE]: string;
	[OPERATION_ID.ASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_ISSUE]: unknown;
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
type Fee = {
	amount: number,
	asset_id: string,
};

interface TranfserOperation {
	fee: Fee;
	from: string;
	to: string;
	amount: {
		amount: number,
		asset_id: string,
	};
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
	fee: Fee;
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
	fee: Fee;
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
	fee: Fee;
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
	fee: Fee;
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
	id: string;
	current_feed_publication_time: string;
	force_settled_volume: number;
	settlement_fund: number;
	feeds: unknown[];
	is_prediction_market: boolean;
	options: {
		short_backing_asset: string;
		maximum_force_settlement_volume: number;
		force_settlement_offset_percent: number;
		force_settlement_delay_sec: number;
		feed_lifetime_sec: number;
		minimum_feeds: number;
		extensions: unknown[];
	};
	current_feed: {
		maintenance_collateral_ratio: number;
		maximum_short_squeeze_ratio: number;
		settlement_price: AssetPriceSchema;
		core_exchange_rate: AssetPriceSchema;
	};
	settlement_price: AssetPriceSchema;
}

interface AssetCreateOperation {
	fee: Fee;
	issuer: string;
	symbol: string;
	precision: number;
	common_options: AssetOptions;
	bitasset_opts: BitassetOpts;
	is_prediction_market: boolean;
	extensions: ExtensionsArr;
}

interface AssetUpdateOperation {
	fee: Fee;
	issuer: string;
	asset_to_update: string;
	new_issuer: string;
	new_options: AssetOptions;
	extensions: ExtensionsArr;
}

interface AssetIssueOperation {
	fee: Fee;
	issuer: AccountId;
	asset_to_issue: {
		amount: number;
		asset_id: AssetId
	};
	issue_to_account: AccountId;
	extensions: ExtensionsArr;
}

interface ContractCreateOperation {
	fee: Fee;
	registrar: string;
	value: {
		amount: number;
		asset_id: string;
	};
	code: string;
	supported_asset_id?: string;
	eth_accuracy: true;
}

interface ContractCallOperation {
	fee: Fee;
	registrar: string;
	value: {
		amount: number,
		asset_id: string,
	};
	code: string;
	callee: string;
}
