import { AccountId, AssetId, ContractResultId, WithdrawId } from '../types/echo';
import { BlockVirtualOperation, constants } from 'echojs-lib';
import Committee from 'echojs-lib/types/interfaces/Committee';

export const ZERO_ACCOUNT = `1.${constants.PROTOCOL_OBJECT_TYPE_ID.ACCOUNT}.0`;
export const CORE_ASSET = '1.3.0';
export const COMMITTEE_GLOBAL_ACCOUNT = `1.${constants.PROTOCOL_OBJECT_TYPE_ID.ACCOUNT}.1`;
export const CONNECT_STATUS = 'connect';

export enum OPERATION_ID {
	TRANSFER = 0,
	TRANSFER_TO_ADDRESS = 1,
	OVERRIDE_TRANSFER = 2,
	ACCOUNT_CREATE = 3,
	ACCOUNT_UPDATE = 4,
	ACCOUNT_WHITELIST = 5,
	ACCOUNT_ADDRESS_CREATE = 6,
	ASSET_CREATE = 7,
	ASSET_UPDATE = 8,
	ASSET_UPDATE_BITASSET = 9,
	ASSET_UPDATE_FEED_PRODUCERS = 10,
	ASSET_ISSUE = 11,
	ASSET_RESERVE = 12,
	ASSET_FUND_FEE_POOL = 13,
	ASSET_PUBLISH_FEED = 14,
	ASSET_CLAIM_FEES = 15,
	PROPOSAL_CREATE = 16,
	PROPOSAL_UPDATE = 17,
	PROPOSAL_DELETE = 18,
	COMMITTEE_MEMBER_CREATE = 19,
	COMMITTEE_MEMBER_UPDATE = 20,
	COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS = 21,
	COMMITTEE_MEMBER_ACTIVATE = 22,
	COMMITTEE_MEMBER_DEACTIVATE = 23,
	COMMITTEE_FROZEN_BALANCE_DEPOSIT = 24,
	COMMITTEE_FROZEN_BALANCE_WITHDRAW = 25,
	VESTING_BALANCE_CREATE = 26,
	VESTING_BALANCE_WITHDRAW = 27,
	BALANCE_CLAIM = 28,
	BALANCE_FREEZE = 29,
	BALANCE_UNFREEZE = 30,
	CONTRACT_CREATE = 31,
	CONTRACT_CALL = 32,
	CONTRACT_INTERNAL_CREATE = 33, // VIRTUAL
	CONTRACT_INTERNAL_CALL = 34, // VIRTUAL
	CONTRACT_SELFDESTRUCT = 35, // VIRTUAL
	CONTRACT_UPDATE = 36,
	CONTRACT_FUND_POOL = 37,
	CONTRACT_WHITELIST = 38,
	SIDECHAIN_ETH_CREATE_ADDRESS = 39,
	SIDECHAIN_ETH_APPROVE_ADDRESS = 40,
	SIDECHAIN_ETH_DEPOSIT = 41,
	SIDECHAIN_ETH_SEND_DEPOSIT = 42,
	SIDECHAIN_ETH_WITHDRAW = 43,
	SIDECHAIN_ETH_SEND_WITHDRAW = 44,
	SIDECHAIN_ETH_APPROVE_WITHDRAW = 45,
	SIDECHAIN_ETH_UPDATE_CONTRACT_ADDRESS = 46,
	SIDECHAIN_ISSUE = 47, // VIRTUAL
	SIDECHAIN_BURN = 48, // VIRTUAL
	SIDECHAIN_ERC20_REGISTER_TOKEN = 49,
	SIDECHAIN_ERC20_DEPOSIT_TOKEN = 50,
	SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN = 51,
	SIDECHAIN_ERC20_WITHDRAW_TOKEN = 52,
	SIDECHAIN_ERC20_SEND_WITHDRAW_TOKEN = 53,
	SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW = 54,
	SIDECHAIN_ERC20_ISSUE = 55, // VIRTUAL
	SIDECHAIN_ERC20_BURN = 56, // VIRTUAL
	SIDECHAIN_BTC_CREATE_ADDRESS = 57,
	SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT = 58,
	SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT = 59,
	SIDECHAIN_BTC_DEPOSIT = 60,
	SIDECHAIN_BTC_WITHDRAW = 61,
	SIDECHAIN_BTC_AGGREGATE = 62,
	SIDECHAIN_BTC_APPROVE_AGGREGATE = 63,
	BLOCK_REWARD = 64, // VIRTUAL
	EVM_ADDRESS_REGISTER = 65,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TransferOperation;
	[OPERATION_ID.TRANSFER_TO_ADDRESS]: TransferToAddressOperation;
	[OPERATION_ID.OVERRIDE_TRANSFER]: OverrideTransfer;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
	[OPERATION_ID.ACCOUNT_ADDRESS_CREATE]: AccountAddressCreateOperation;
	[OPERATION_ID.ASSET_CREATE]: AssetCreateOperation;
	[OPERATION_ID.ASSET_UPDATE]: AssetUpdateOperation;
	[OPERATION_ID.ASSET_UPDATE_BITASSET]: AssetBitAssetUpdateOperation;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: AssetUpdateFeedProducers;
	[OPERATION_ID.ASSET_ISSUE]: AssetIssueOperation;
	[OPERATION_ID.ASSET_RESERVE]: AssetReserveOperation;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: AssetFundFeePoolOperation;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: AssetPublishFeed;
	[OPERATION_ID.ASSET_CLAIM_FEES]: AssetClaimFeesOperation;
	[OPERATION_ID.PROPOSAL_CREATE]: ProposalCreateOperation;
	[OPERATION_ID.BALANCE_FREEZE]: BalanceFreezeOperation;
	[OPERATION_ID.BALANCE_UNFREEZE]: BalanceUnfreezeOperation;
	[OPERATION_ID.CONTRACT_CREATE]: ContractCreateOperation;
	[OPERATION_ID.CONTRACT_CALL]: ContractCallOperation;
	[OPERATION_ID.CONTRACT_INTERNAL_CREATE]: ContractInternalCreate;
	[OPERATION_ID.CONTRACT_INTERNAL_CALL]: ContractInternalCall;
	[OPERATION_ID.CONTRACT_SELFDESTRUCT]: ContractSelfdestruct;
	[OPERATION_ID.VESTING_BALANCE_CREATE]: VestingBalanceCreate;
	[OPERATION_ID.VESTING_BALANCE_WITHDRAW]: VestingBalanceWithdraw;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS]: CommitteeMemberUpdateGlobalParametersProps
	[OPERATION_ID.COMMITTEE_MEMBER_ACTIVATE]: CommitteeMemberActivate;
	[OPERATION_ID.COMMITTEE_MEMBER_DEACTIVATE]: CommitteeMemberDeactivate;
	[OPERATION_ID.COMMITTEE_FROZEN_BALANCE_DEPOSIT]: CommitteeFrozenBalanceDeposit;
	[OPERATION_ID.COMMITTEE_FROZEN_BALANCE_WITHDRAW]: CommitteeFrozenBalanceWithdraw;
	[OPERATION_ID.BALANCE_CLAIM]: BalanceClaimOperation;
	[OPERATION_ID.PROPOSAL_UPDATE]: ProposalUpdateOperation;
	[OPERATION_ID.PROPOSAL_DELETE]: ProposalDeleteOperation;
	[OPERATION_ID.COMMITTEE_MEMBER_CREATE]: CommitteeMemberCreateOperation;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE]: CommitteMemberUpdateOperation;
	[OPERATION_ID.SIDECHAIN_ETH_CREATE_ADDRESS]: SidechainEthCreateAddressOperation;
	[OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS]: SidechainEthApproveAddressOperation;
	[OPERATION_ID.SIDECHAIN_ETH_DEPOSIT]: SidechainEthDepositOperation;
	[OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT]: SidechainEthSendDepositOperation;
	[OPERATION_ID.SIDECHAIN_ETH_WITHDRAW]: SidechainEthWithdrawOperation;
	[OPERATION_ID.SIDECHAIN_ETH_SEND_WITHDRAW]: SidechainEthSendWithdraw;
	[OPERATION_ID.SIDECHAIN_ETH_APPROVE_WITHDRAW]: SidechainEthApproveWithdraw;
	[OPERATION_ID.CONTRACT_FUND_POOL]: ContractFundPoolOperation;
	[OPERATION_ID.CONTRACT_WHITELIST]: ContractWhitelistOperation;
	[OPERATION_ID.SIDECHAIN_ISSUE]: SidechainEthIssueOperation;
	[OPERATION_ID.SIDECHAIN_BURN]: SidechainEthBurnOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN]: SidechainErc20RegisterTokenOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN]: SidechainErc20DepositTokenOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN]: SidechainErc20SendDepositTokenOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN]: SidechainErc20WithdrawTokenOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_SEND_WITHDRAW_TOKEN]: SidechainErc20SendWithdrawTokenOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW]: SidechainErc20ApproveTokenWithdrawOperation;
	[OPERATION_ID.SIDECHAIN_ERC20_ISSUE]: SidechainErc20Issue;
	[OPERATION_ID.SIDECHAIN_ERC20_BURN]: SidechainErc20Burn;
	[OPERATION_ID.SIDECHAIN_BTC_CREATE_ADDRESS]: SidechainBtcCreateAddress;
	[OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT]: SidechainBtcCreateIntermediateDeposit;
	[OPERATION_ID.SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT]: SidechainBtcIntermediateDeposit;
	[OPERATION_ID.SIDECHAIN_BTC_DEPOSIT]: SidechainBtcDeposit;
	[OPERATION_ID.SIDECHAIN_BTC_WITHDRAW]: SidechainBtcWithdraw;
	[OPERATION_ID.SIDECHAIN_BTC_AGGREGATE]: SidechainBtcAggregate;
	[OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE]: SidechainBtcApproveAggregate;
	[OPERATION_ID.CONTRACT_UPDATE]: ContractUpdateOperation;
	[OPERATION_ID.BLOCK_REWARD]: BlockRewardOperation;
	[OPERATION_ID.EVM_ADDRESS_REGISTER]: EVMAddressRegister;
};

export type OperationResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.TRANSFER_TO_ADDRESS]: unknown;
	[OPERATION_ID.OVERRIDE_TRANSFER]: unknown;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
	[OPERATION_ID.ACCOUNT_ADDRESS_CREATE]: string;
	[OPERATION_ID.ASSET_CREATE]: string;
	[OPERATION_ID.ASSET_UPDATE]: unknown;
	[OPERATION_ID.ASSET_UPDATE_BITASSET]: unknown;
	[OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: unknown;
	[OPERATION_ID.ASSET_ISSUE]: unknown;
	[OPERATION_ID.ASSET_RESERVE]: unknown;
	[OPERATION_ID.ASSET_FUND_FEE_POOL]: unknown;
	[OPERATION_ID.ASSET_PUBLISH_FEED]: unknown;
	[OPERATION_ID.ASSET_CLAIM_FEES]: unknown;
	[OPERATION_ID.PROPOSAL_CREATE]: string;
	[OPERATION_ID.PROPOSAL_UPDATE]: unknown;
	[OPERATION_ID.PROPOSAL_DELETE]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_CREATE]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_ACTIVATE]: unknown;
	[OPERATION_ID.COMMITTEE_MEMBER_DEACTIVATE]: unknown;
	[OPERATION_ID.COMMITTEE_FROZEN_BALANCE_DEPOSIT]: unknown;
	[OPERATION_ID.COMMITTEE_FROZEN_BALANCE_WITHDRAW]: unknown;
	[OPERATION_ID.VESTING_BALANCE_CREATE]: unknown;
	[OPERATION_ID.VESTING_BALANCE_WITHDRAW]: unknown;
	[OPERATION_ID.BALANCE_CLAIM]: unknown;
	[OPERATION_ID.BALANCE_FREEZE]: unknown;
	[OPERATION_ID.BALANCE_UNFREEZE]: unknown;
	[OPERATION_ID.CONTRACT_CREATE]: string;
	[OPERATION_ID.CONTRACT_CALL]: ContractResultId;
	[OPERATION_ID.CONTRACT_INTERNAL_CREATE]: unknown;
	[OPERATION_ID.CONTRACT_INTERNAL_CALL]: unknown;
	[OPERATION_ID.CONTRACT_SELFDESTRUCT]: unknown;
	[OPERATION_ID.CONTRACT_UPDATE]: unknown;
	[OPERATION_ID.CONTRACT_FUND_POOL]: unknown;
	[OPERATION_ID.CONTRACT_WHITELIST]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_CREATE_ADDRESS]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_DEPOSIT]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_WITHDRAW]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_SEND_WITHDRAW]: unknown;
	[OPERATION_ID.SIDECHAIN_ETH_APPROVE_WITHDRAW]: unknown;
	[OPERATION_ID.SIDECHAIN_ISSUE]: unknown;
	[OPERATION_ID.SIDECHAIN_BURN]: unknown;
	[OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN]: string;
	[OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN]: unknown;
	[OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN]: unknown;
	[OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN]: string;
	[OPERATION_ID.SIDECHAIN_ERC20_SEND_WITHDRAW_TOKEN]: string;
	[OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW]: unknown;
	[OPERATION_ID.SIDECHAIN_ERC20_ISSUE]: unknown;
	[OPERATION_ID.SIDECHAIN_ERC20_BURN]: unknown;
	[OPERATION_ID.SIDECHAIN_BTC_CREATE_ADDRESS]: string;
	[OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT]: unknown;
	[OPERATION_ID.SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT]: unknown;
	[OPERATION_ID.SIDECHAIN_BTC_DEPOSIT]: unknown;
	[OPERATION_ID.SIDECHAIN_BTC_WITHDRAW]: unknown;
	[OPERATION_ID.SIDECHAIN_BTC_AGGREGATE]: unknown;
	[OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE]: unknown;
	[OPERATION_ID.BLOCK_REWARD]: unknown;
	[OPERATION_ID.EVM_ADDRESS_REGISTER]: unknown;
};

export type KNOWN_OPERATION = Extract<keyof Operations, OPERATION_ID>;

export type OPERATION_PROPS<T extends keyof Operations> = Operations[T];

export type OPERATION_WITH_INJECTED_VIRTUALS<T extends keyof Operations> = Operations[T] & {
	virtual_operations?: BlockVirtualOperation['op'][];
};

export type OPERATION_RESULT<T extends keyof OperationResult> = OperationResult[T];

export type Authority = [number, {}];
type ExtensionsArr = unknown[];
type ExtensionsObj = {};
type NewParameters = {
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
		eth_committee_update_method: IEth;
		eth_gen_address_method: IEth;
		eth_withdraw_method: IEth;
		eth_update_addr_method: IEth;
		eth_withdraw_token_method: IEth;
		eth_collect_tokens_method: IEth;
		eth_committee_updated_topic: String;
		eth_gen_address_topic: String;
		eth_deposit_topic: String;
		eth_withdraw_topic: String;
		erc20_deposit_topic: String;
		ETH_asset_id: String;
		fines: {
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
};

export interface IAmount {
	amount: number | string;
	asset_id: AssetId;
}

export interface IPolicy {
	begin_timestamp: String;
	vesting_cliff_seconds: Number;
	vesting_duration_seconds: Number;
}

export interface IEth {
	method: String;
	gas: Number;
}
interface TransferOperation {
	fee: IAmount;
	from: string;
	to: string;
	amount: IAmount;
	extensions: ExtensionsArr;
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
	evm_address?: string;
	new_account_id?: string;
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
	core_exchange_rate: IAssetPrice;
	extensions: ExtensionsArr;
	feeded_asset_price?: string;
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

interface BalanceUnfreezeOperation {
	account: AccountId;
	amount: IAmount;
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

	result?: {
		contract_id: string;
		logs: {
			address: string;
			log: string[];
			data: string;
			block_num: number;
			trx_num: number;
			op_num: number;
		}[],
	};
}

interface ContractCallOperation {
	fee: IAmount;
	registrar: string;
	value: IAmount;
	code: string;
	callee: string;
	extensions: ExtensionsArr;
}

interface ContractInternalCreate {
	fee: IAmount;
	caller: string;
	new_contract: string;
	value: IAmount;
	eth_accuracy: boolean;
	supported_asset_id?: string;
	extensions: ExtensionsArr;
}

interface ContractInternalCall {
	fee: IAmount;
	caller: string;
	callee: string;
	method: string;
	value: IAmount;
	extensions: ExtensionsArr;
}

interface ContractSelfdestruct {
	fee: IAmount;
	contract: string;
	recipient: string;
	amounts: IAmount[];
	extensions: ExtensionsArr;
}

interface VestingBalanceCreate {
	fee: IAmount;
	creator: AccountId;
	owner: AccountId;
	amount: IAmount;
	policy: IPolicy;
	extensions: ExtensionsArr;
}

interface VestingBalanceWithdraw {
	fee: IAmount;
	vesting_balance: string;
	owner: AccountId;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface CommitteeMemberUpdateGlobalParametersProps {
	fee: IAmount;
	new_parameters: NewParameters;
	extensions: ExtensionsArr;
}

interface CommitteeMemberActivate {
	fee: IAmount;
	committee_to_activate: string;
	extensions: ExtensionsArr;
}

interface CommitteeMemberDeactivate {
	fee: IAmount;
	committee_to_deactivate: string;
	extensions: ExtensionsArr;
}

interface CommitteeFrozenBalanceDeposit {
	fee: IAmount;
	committee_member_account: string;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface CommitteeFrozenBalanceWithdraw {
	fee: IAmount;
	committee_member_account: string;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface BalanceClaimOperation {
	fee: IAmount;
	deposit_to_account: AccountId;
	balance_to_claim: IAmount;
	balance_owner_key: string;
	total_claimed: IAmount;
	extensions: ExtensionsArr;
}

interface OverrideTransfer {
	fee: IAmount;
	issuer: AccountId;
	from: AccountId;
	to: AccountId;
	amount: IAmount;
	extensions: ExtensionsArr;
}
interface ProposalCreateOperation {
	fee: IAmount;
	fee_paying_account: AccountId;
	proposed_ops: unknown[];
	expiration_time: string;
	review_period_seconds?: number;
	have_delete_operation?: boolean;
	approvals?: string[];
	extensions: ExtensionsArr;
}

interface ProposalUpdateOperation {
	fee: IAmount;
	fee_paying_account: AccountId;
	proposal: string;
	active_approvals_to_add: AccountId[];
	active_approvals_to_remove: AccountId[];
	owner_approvals_to_remove: AccountId[];
	key_approvals_to_add: string[];
	key_approvals_to_remove: string[];
	create_operation?: string;
	extensions: ExtensionsArr;
}

interface ProposalDeleteOperation {
	fee: IAmount;
	fee_paying_account: AccountId;
	using_owner_authority: boolean;
	proposal: string;
	create_operation?: string;
	extensions: ExtensionsArr;
}

interface CommitteeMemberCreateOperation {
	fee: IAmount;
	committee_member_account: AccountId;
	url: string;
	eth_address: string;
	btc_public_key: string;
	extensions: ExtensionsArr;
}

interface CommitteMemberUpdateOperation {
	fee: IAmount;
	committee_member: AccountId;
	committee_member_account: AccountId;
	new_url: string;
	new_eth_address: string;
	new_btc_public_key: string;
}

interface AccountAddressCreateOperation {
	fee: IAmount;
	owner: AccountId;
	label: string;
	extensions: ExtensionsArr;
	address?: string;
}

interface TransferToAddressOperation {
	fee: IAmount;
	from: AccountId;
	to: AccountId;
	amount: IAmount;
	extensions: ExtensionsArr;
}

interface SidechainEthCreateAddressOperation {
	fee: IAmount;
	account: AccountId;
	extensions: ExtensionsArr;
}

interface SidechainEthApproveAddressOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	malicious_committeemen: AccountId[];
	account: AccountId;
	eth_addr: string;
	extensions: ExtensionsArr;
}

interface SidechainEthDepositOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	deposit_id: number;
	account: AccountId;
	value: number;
	from_address?: string;
	extensions: ExtensionsArr;
}

interface SidechainEthSendDepositOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	deposit_id: string;
	extensions: ExtensionsArr;
	amount?: number;
	account?: AccountId;
}
interface SidechainEthWithdrawOperation {
	fee: IAmount;
	account: AccountId;
	eth_addr: string;
	value: number;
	extensions: ExtensionsArr;
}

interface SidechainEthApproveWithdraw {
	fee: IAmount;
	committee_member_id: AccountId;
	withdraw_id: number;
	extensions: ExtensionsArr;
}

interface SidechainEthSendWithdraw {
	fee: IAmount;
	committee_member_id: AccountId;
	withdraw_id: string;
	extensions: ExtensionsArr;
}

interface ContractFundPoolOperation {
	fee: IAmount;
	sender: AccountId;
	contract: string;
	value: IAmount;

}

interface ContractWhitelistOperation {
	fee: IAmount;
	sender: AccountId;
	contract: string;
	add_to_whitelist: AccountId[];
	remove_from_whitelist: AccountId[];
	add_to_blacklist: AccountId[];
	remove_from_blacklist: AccountId[];
	extensions: ExtensionsArr;
}

interface SidechainEthIssueOperation {
	fee: IAmount;
	value: IAmount;
	account: AccountId;
	deposit_id: string;
	sidchain_eth_deposit?: string;
	list_of_approvals?: string[];
	extensions: ExtensionsArr;
}

interface SidechainEthBurnOperation {
	fee: IAmount;
	value: IAmount;
	account: AccountId;
	withdraw_id: string;
	sidchain_eth_withdraw?: string;
	list_of_approvals?: string[];
	extensions: ExtensionsArr;
}

interface SidechainErc20RegisterTokenOperation {
	fee: IAmount;
	account: AccountId;
	eth_addr: string;
	name: string;
	symbol: string;
	decimals: number;
	associated_contract?: string;
	extensions: ExtensionsArr;
}

interface SidechainErc20DepositTokenOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	malicious_committeemen: AccountId[];
	account: AccountId;
	erc20_token_addr: string;
	value: string;
	transaction_hash: string;
	deposit_id?: string;
	extensions: ExtensionsArr;
}

interface SidechainErc20SendDepositTokenOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	deposit_id?: string;
	sidchain_erc20_token_deposit?: string;
	extensions: ExtensionsArr;
}

interface SidechainErc20WithdrawTokenOperation {
	fee: IAmount;
	account: AccountId;
	to: string;
	erc20_token: string;
	value: string;
	withdraw_id?: WithdrawId;
	extensions: ExtensionsArr;
}

interface SidechainErc20SendWithdrawTokenOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	withdraw_id: WithdrawId;
	sidchain_erc_20_withdraw_token?: string;
	extensions: ExtensionsArr;
}

interface SidechainErc20SendWithdrawTokenOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	withdraw_id: string;
	sidchain_erc_20_withdraw_token?: string;
	extensions: ExtensionsArr;
}

interface SidechainErc20ApproveTokenWithdrawOperation {
	fee: IAmount;
	committee_member_id: AccountId;
	withdraw_id: number;
	sidchain_erc_20_withdraw_token?: string;
	extensions: ExtensionsArr;
}

interface SidechainErc20Issue {
	fee: IAmount;
	deposit: string;
	account: string;
	token: string;
	amount: string;
	sidchain_erc_20_deposit_token?: string;
	list_of_approvals?: string[];
	extensions: ExtensionsArr;
}

interface SidechainErc20Burn {
	fee: IAmount;
	withdraw: string;
	account: string;
	token: string;
	amount: string;
	sidchain_erc_20_withdraw_token?: string;
	list_of_approvals?: string[];
	extensions: ExtensionsArr;
}

interface SidechainBtcCreateAddress {
	fee: IAmount;
	account: string;
	backup_address: string;
	received_deposit_address?: string;
}

interface BtcTransactionDetails {
	block_number: number | string;
	out: {
		tx_id: string;
		index: number;
		amount: number
	};
}

interface SidechainBtcCreateIntermediateDeposit {
	fee: IAmount;
	committee_member_id: string;
	account: string;
	btc_address_id: string;
	tx_info: BtcTransactionDetails;
	extensions: ExtensionsArr;
	committee_member?: Committee;
	deposit_address?: string;
	transaction_hash?: string;
}

interface SidechainBtcIntermediateDeposit {
	fee: IAmount;
	committee_member_id: string;
	intermediate_address_id: string;
	signature: string;
	extensions: ExtensionsArr;
	committee_member?: Committee;
	intermediate_address?: string;
}

interface SidechainBtcDeposit {
	fee: IAmount;
	committee_member_id: string;
	account: string;
	intermediate_deposit_id: string;
	tx_info: BtcTransactionDetails;
	extensions: ExtensionsArr;
	amount?: number;
	committee_member?: Committee;
	transaction_hash?: string;
}

interface SidechainBtcWithdraw {
	fee: IAmount;
	account: string;
	btc_addr: string;
	value: number | string;
	extensions: ExtensionsArr;
}

interface SidechainBtcAggregate {
	fee: IAmount;
	committee_member_id: string;
	deposits: string[];
	withdrawals: string[];
	transaction_id: string;
	aggregation_out_value: number | string;
	sma_address: { address: string };
	committee_member_ids_in_script: [string, string][];
	previous_aggregation: string;
	cpfp_depth: number;
	signatures: [number, string];
	extensions: ExtensionsArr;
	committee_member?: Committee;
}

interface SidechainBtcApproveAggregate {
	fee: IAmount;
	committee_member_id: string;
	transaction_id: string;
	extensions: ExtensionsArr;
	committee_member?: Committee;
	aggregate_request_operation?: string;
}

interface ContractUpdateOperation {
	fee: IAmount;
	sender: AccountId;
	contract: string;
	new_owner: AccountId;
	extensions: ExtensionsArr;
}

interface BlockRewardOperation {
	fee: undefined;
	receiver: AccountId;
	assets: [{ amount: number, asset_id: AssetId }];
	extensions: ExtensionsArr;
}

interface EVMAddressRegister {
	fee: IAmount;
	owner: string;
	evm_address: string;
	extensions: ExtensionsArr;
}
