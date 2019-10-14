import { AccountId, AssetId, ContractResultId } from '../types/echo';
export const CORE_ASSET = '1.3.0';

export const CONNECT_STATUS = 'connect';

export enum OPERATION_ID {
	TRANSFER,
	ACCOUNT_CREATE,
	ACCOUNT_UPDATE,
	ACCOUNT_WHITELIST,
	ASSET_CREATE,
	ASSET_UPDATE,
	ASSET_UPDATE_BITASSET,
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
	BALANCE_FREEZE,
	OVERRIDE_TRANSFER,
	ASSET_CLAIM_FEES,
	CONTRACT_CREATE,
	CONTRACT_CALL,
	CONTRACT_TRANSFER,
	CONTRACT_UPDATE,
	ACCOUNT_ADDRESS_CREATE,
	TRANSFER_TO_ADDRESS,
	SIDECHAIN_ETH_CREATE_ADDRESS,
	SIDECHAIN_ETH_APPROVE_ADDRESS,
	SIDECHAIN_ETH_DEPOSIT,
	SIDECHAIN_ETH_WITHDRAW,
	SIDECHAIN_ETH_APPROVE_WITHDRAW,
	CONTRACT_FUND_POOL,
	CONTRACT_WHITELIST,
	SIDECHAIN_ISSUE, // VIRTUAL
	SIDECHAIN_BURN, // VIRTUAL
	SIDECHAIN_ERC20_REGISTER_TOKEN,
	SIDECHAIN_ERC20_DEPOSIT_TOKEN,
	SIDECHAIN_ERC20_WITHDRAW_TOKEN,
	SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW,
	SIDECHAIN_ERC20_ISSUE, // VIRTUAL
	SIDECHAIN_ERC20_BURN, // VIRTUAL
	SIDECHAIN_BTC_CREATE_ADDRESS,
	SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT,
	SIDECHAIN_BTC_DEPOSIT,
	SIDECHAIN_BTC_WITHDRAW,
	SIDECHAIN_BTC_APPROVE_WITHDRAW,
	SIDECHAIN_BTC_AGGREGATE,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TransferOperation;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
	[OPERATION_ID.ASSET_CREATE]: AssetCreateOperation;
	[OPERATION_ID.ASSET_UPDATE]: AssetUpdateOperation;
	[OPERATION_ID.ASSET_UPDATE_BITASSET]: AssetBitAssetUpdateOperation;
	[OPERATION_ID.ASSET_ISSUE]: AssetIssueOperation;
	[OPERATION_ID.ASSET_RESERVE]: AssetReserveOperation;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: AssetFundFeePoolOperation;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: AssetPublishFeed;
	[OPERATION_ID.ASSET_CLAIM_FEES]: AssetClaimFeesOperation;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: AssetUpdateFeedProducers;
	[OPERATION_ID.BALANCE_FREEZE]: BalanceFreezeOperation;
	[OPERATION_ID.CONTRACT_CREATE]: ContractCreateOperation;
	[OPERATION_ID.CONTRACT_CALL]: ContractCallOperation;
	[OPERATION_ID.CONTRACT_TRANSFER]: ContractTransferOperation;
	[OPERATION_ID.PROPOSAL_CREATE]: ProposalCreateOperation;
	[OPERATION_ID.PROPOSAL_UPDATE]: ProposalUpdateOperation;
	[OPERATION_ID.PROPOSAL_DELETE]: ProposalDeleteOperation;
	[OPERATION_ID.COMMITTEE_MEMBER_CREATE]: CommitteeMemberCreateOperation;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE]: CommitteMemberUpdateOperation;
	[OPERATION_ID.ACCOUNT_ADDRESS_CREATE]: AccountAddressCreateOperation;
	[OPERATION_ID.TRANSFER_TO_ADDRESS]: TransferToAddressOperation;
	[OPERATION_ID.SIDECHAIN_ETH_CREATE_ADDRESS]: SidechainEthCreateAddressOperation;
	[OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS]: SidechainEthApproveAddressOperation;
	[OPERATION_ID.SIDECHAIN_ETH_DEPOSIT]: SidechainEthDepositOperation;
};

export type OperationResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
	[OPERATION_ID.ASSET_CREATE]: string;
	[OPERATION_ID.ASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_UPDATE_BITASSET]: unknown;
	[OPERATION_ID.ASSET_ISSUE]: unknown;
	[OPERATION_ID.ASSET_RESERVE]: unknown;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: unknown;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: unknown;
	[OPERATION_ID.ASSET_CLAIM_FEES]: unknown;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: unknown;
	[OPERATION_ID.BALANCE_FREEZE]: unknown;
	[OPERATION_ID.CONTRACT_CREATE]: string;
	[OPERATION_ID.CONTRACT_CALL]: ContractResultId;
	[OPERATION_ID.CONTRACT_TRANSFER]: unknown;
	[OPERATION_ID.PROPOSAL_CREATE]: string;
	[OPERATION_ID.PROPOSAL_UPDATE]: unknown;
	[OPERATION_ID.PROPOSAL_DELETE]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_CREATE]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE]: unknown;
	[OPERATION_ID.ACCOUNT_ADDRESS_CREATE]: string;
	[OPERATION_ID.TRANSFER_TO_ADDRESS]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_CREATE_ADDRESS]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_DEPOSIT]: unknown;
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

interface BalanceFreezeOperation {
	account: AccountId;
	amount: IAmount;
	duration: number;
	fee: IAmount;
	extensions: ExtensionsArr;
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

interface ProposalCreateOperation {
	fee: IAmount;
	fee_paying_account: string;
	proposed_ops: unknown[];
	expiration_time: string;
	review_period_seconds: number;
	extensions: ExtensionsArr;
}

interface ProposalUpdateOperation {
	fee: IAmount;
	fee_paying_account: string;
	proposal: string;
	active_approvals_to_add: AccountId[];
	active_apprivals_to_remove: AccountId[];
	owner_approvals_to_remove: AccountId[];
	key_approvals_to_add: string[];
	key_approvals_to_remove: string[];
	extensions: ExtensionsArr;
}

interface ProposalDeleteOperation {
	fee: IAmount;
	fee_paying_account: string;
	using_owner_authority: boolean;
	proposal: string;
	extensions: ExtensionsArr;
}

interface CommitteeMemberCreateOperation {
	fee: IAmount;
	committee_member_account: string;
	url: string;
	eth_address: string;
	btc_public_key: string;
	extensions: ExtensionsArr;
}

interface CommitteMemberUpdateOperation {
	fee: IAmount;
	committee_member: string;
	committee_member_account: string;
	new_url: string;
	new_eth_address: string;
	new_btc_public_key: string;
}

interface AccountAddressCreateOperation {
	fee: IAmount;
	owner: string;
	label: string;
	extensions: ExtensionsArr;
}

interface TransferToAddressOperation {
	fee: IAmount;
	from: string;
	to: string;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface SidechainEthCreateAddressOperation {
	fee: IAmount;
	account: string;
	extensions: ExtensionsArr;
}

interface SidechainEthApproveAddressOperation {
	fee: IAmount;
	committee_member_id: string;
	malicious_committeemen: string[];
	account: string;
	eth_addr: string;
	extensions: ExtensionsArr;
}

interface SidechainEthDepositOperation {
	fee: IAmount;
	committee_member_id: string;
	deposit_id: number,
	account: string;
	value: number;
	extensions: ExtensionsArr;
}
