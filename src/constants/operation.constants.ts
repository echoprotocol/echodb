import * as ECHO from './echo.constants';

export const FEE_PAYER_FIELD: { [x in ECHO.OPERATION_ID]: string} = {
	[ECHO.OPERATION_ID.TRANSFER]: 'from',
	[ECHO.OPERATION_ID.LIMIT_ORDER_CREATE]: 'seller',
	[ECHO.OPERATION_ID.LIMIT_ORDER_CANCEL]: 'fee_paying_account',
	[ECHO.OPERATION_ID.CALL_ORDER_UPDATE]: 'funding_account',
	[ECHO.OPERATION_ID.FILL_ORDER]: 'account_id',
	[ECHO.OPERATION_ID.ACCOUNT_CREATE]: 'registrar',
	[ECHO.OPERATION_ID.ACCOUNT_UPDATE]: 'account',
	[ECHO.OPERATION_ID.ACCOUNT_WHITELIST]: 'authorizing_account',
	[ECHO.OPERATION_ID.ACCOUNT_UPGRADE]: 'account_to_upgrade',
	[ECHO.OPERATION_ID.ACCOUNT_TRANSFER]: 'account_id',
	[ECHO.OPERATION_ID.ASSET_CREATE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_UPDATE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_BITASSET_UPDATE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_ISSUE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_RESERVE]: 'payer',
	[ECHO.OPERATION_ID.ASSET_FUND_FEE_POOL]: 'from_account',
	[ECHO.OPERATION_ID.ASSET_SETTLE]: 'account',
	[ECHO.OPERATION_ID.ASSET_GLOBAL_SETTLE]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_PUBLISH_FEED]: 'publisher',
	[ECHO.OPERATION_ID.PROPOSAL_CREATE]: 'fee_paying_account',
	[ECHO.OPERATION_ID.PROPOSAL_UPDATE]: 'fee_paying_account',
	[ECHO.OPERATION_ID.PROPOSAL_DELETE]: 'fee_paying_account',
	[ECHO.OPERATION_ID.WITHDRAW_PERMISSION_CREATE]: 'withdraw_from_account',
	[ECHO.OPERATION_ID.WITHDRAW_PERMISSION_UPDATE]: 'withdraw_from_account',
	[ECHO.OPERATION_ID.WITHDRAW_PERMISSION_CLAIM]: 'withdraw_to_account',
	[ECHO.OPERATION_ID.WITHDRAW_PERMISSION_DELETE]: 'withdraw_from_account',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_CREATE]: 'committee_member_account',
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE]: 'committee_member_account',
	// committee_member/_committee_member_update_global_parameters_operation/
	[ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS]: '',
	[ECHO.OPERATION_ID.VESTING_BALANCE_CREATE]: 'creator',
	[ECHO.OPERATION_ID.VESTING_BALANCE_WITHDRAW]: 'owner',
	[ECHO.OPERATION_ID.CUSTOM]: 'payer',
	[ECHO.OPERATION_ID.ASSERT]: 'fee_paying_account',
	[ECHO.OPERATION_ID.BALANCE_CLAIM]: 'deposit_to_account',
	[ECHO.OPERATION_ID.OVERRIDE_TRANSFER]: 'issuer',
	[ECHO.OPERATION_ID.ASSET_SETTLE_CANCEL]: 'account',
	[ECHO.OPERATION_ID.ASSET_CLAIM_FEES]: 'issuer',
	[ECHO.OPERATION_ID.BID_COLLATERAL]: 'bidder',
	[ECHO.OPERATION_ID.EXECUTE_BID]: 'bidder',
	[ECHO.OPERATION_ID.CONTRACT_CREATE]: 'registrar',
	[ECHO.OPERATION_ID.CONTRACT_CALL]: 'registrar',
	[ECHO.OPERATION_ID.CONTRACT_TRANSFER]: '', // contracts/_contract_transfer_operation/
	[ECHO.OPERATION_ID.CHANGE_SIDECHAIN_CONFIG]: '',
	[ECHO.OPERATION_ID.ACCOUNT_ADDRESS_CREATE]: '',
	[ECHO.OPERATION_ID.TRANSFER_TO_ADDRESS]: '',
	[ECHO.OPERATION_ID.GENERATE_ETH_ADDRESS]: '',
	[ECHO.OPERATION_ID.CREATE_ETH_ADDRESS]: '',
	[ECHO.OPERATION_ID.DEPOSIT_ETH]: '',
	[ECHO.OPERATION_ID.WITHDRAW_ETH]: '',
	[ECHO.OPERATION_ID.APPROVE_WITHDRAW_ETH]: '',
	[ECHO.OPERATION_ID.CONTRACT_FUND_POOL]: '',
	[ECHO.OPERATION_ID.CONTRACT_WHITELIST]: '',
	[ECHO.OPERATION_ID.CONTRACT_ISSUE]: '',
	[ECHO.OPERATION_ID.CONTRACT_BURN]: '',
};
