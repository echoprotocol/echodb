import * as ECHO from './echo.constants';

export const FEE_PAYER_FIELD: { [x in ECHO.OPERATION_ID]: string} = {
	[ECHO.OPERATION_ID.TRANSFER]: 'from',
	[ECHO.OPERATION_ID.TRANSFER_TO_ADDRESS]: '',
	[ECHO.OPERATION_ID.OVERRIDE_TRANSFER]: 'issuer',
	[ECHO.OPERATION_ID.ACCOUNT_CREATE]: 'registrar',
	[ECHO.OPERATION_ID.ACCOUNT_UPDATE]: 'account',
	[ECHO.OPERATION_ID.ACCOUNT_WHITELIST]: 'authorizing_account',
	[ECHO.OPERATION_ID.ACCOUNT_ADDRESS_CREATE]: '',
	[ECHO.OPERATION_ID.ASSET_CREATE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_UPDATE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_UPDATE_BITASSET]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_ISSUE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_RESERVE]: 'payer',
	[ECHO.OPERATION_ID.ASSET_FUND_FEE_POOL]: 'from_account',
	[ECHO.OPERATION_ID.ASSET_PUBLISH_FEED]: 'publisher',
	[ECHO.OPERATION_ID.ASSET_CLAIM_FEES]: '',
	[ECHO.OPERATION_ID.PROPOSAL_CREATE]: 'fee_paying_account',
	[ECHO.OPERATION_ID.PROPOSAL_UPDATE]: 'fee_paying_account',
	[ECHO.OPERATION_ID.PROPOSAL_DELETE]: 'fee_paying_account',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_CREATE]: 'committee_member_account',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE]: 'committee_member_account',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS]: '',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_ACTIVATE]: '',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_DEACTIVATE]: '',
	[ECHO.OPERATION_ID.COMMITTEE_FROZEN_BALANCE_DEPOSIT]: '',
	[ECHO.OPERATION_ID.COMMITTEE_FROZEN_BALANCE_WITHDRAW]: '',
	[ECHO.OPERATION_ID.VESTING_BALANCE_CREATE]: 'creator',
	[ECHO.OPERATION_ID.VESTING_BALANCE_WITHDRAW]: 'owner',
	[ECHO.OPERATION_ID.BALANCE_CLAIM]: 'deposit_to_account',
	[ECHO.OPERATION_ID.BALANCE_FREEZE]: '',
	[ECHO.OPERATION_ID.BALANCE_UNFREEZE]: '',
	[ECHO.OPERATION_ID.CONTRACT_CREATE]: 'registrar',
	[ECHO.OPERATION_ID.CONTRACT_CALL]: 'registrar',
	[ECHO.OPERATION_ID.CONTRACT_INTERNAL_CREATE]: '',
	[ECHO.OPERATION_ID.CONTRACT_INTERNAL_CALL]: '',
	[ECHO.OPERATION_ID.CONTRACT_SELFDESTRUCT]: '',
	[ECHO.OPERATION_ID.CONTRACT_UPDATE]: '',
	[ECHO.OPERATION_ID.CONTRACT_FUND_POOL]: '',
	[ECHO.OPERATION_ID.CONTRACT_WHITELIST]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_CREATE_ADDRESS]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT]: 'committee_member_id',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_WITHDRAW]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_WITHDRAW]: 'committee_member_id',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_WITHDRAW]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ETH_UPDATE_CONTRACT_ADDRESS]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ISSUE]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BURN]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT]: 'committee_member_id',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_WITHDRAW]: 'committee_member_id',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_ISSUE]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_ERC20_BURN]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_ADDRESS]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_DEPOSIT]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_WITHDRAW]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_AGGREGATE]: '',
	[ECHO.OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE]: '',
	[ECHO.OPERATION_ID.BLOCK_REWARD]: '',
};
