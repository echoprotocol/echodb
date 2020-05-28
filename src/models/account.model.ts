import AbstractModel from './abstract.model';
import * as MODEL from '../constants/model.constants';
import { IAccount } from '../interfaces/IAccount';
import { Schema } from 'mongoose';

export default AbstractModel<IAccount>(MODEL.NAME.ACCOUNT, {
	id: String,
	registrar: String,
	network_fee_percentage: Number,
	name: String,
	active: {
		weight_threshold: Number,
		account_auths: [Schema.Types.Mixed],
		key_auths: [[Schema.Types.Mixed]],
	   address_auths: [Schema.Types.Mixed],
	},
	echorand_key: String,
	options: {
		voting_account: String,
		delegating_account: String,
		num_committee: Number,
		votes: [Schema.Types.Mixed],
	   extensions: [Schema.Types.Mixed],
	},
	statistics: String,
	whitelisting_accounts: [Schema.Types.Mixed],
	blacklisting_accounts: [Schema.Types.Mixed],
	whitelisted_accounts: [Schema.Types.Mixed],
	blacklisted_accounts: [Schema.Types.Mixed],
	owner_special_authority: [Schema.Types.Mixed],
	active_special_authority: [Schema.Types.Mixed],
	top_n_control_flags: Number,
	evm_address: String,
	addresses: [Schema.Types.Mixed],
	concentration_balance_rate: { type: Number, default: 0 },
	concentration_history_rate: { type: Number, default: 0 },
	committee_options: {
		status: String,
		eth_address: String,
		btc_public_key: String,
		committee_member_id: String,
		proposal_operation: String,
		approves_count: Number,
		last_status_change_time: String,
		last_executed_operation: String,
		last_executed_operation_id: Number,
		proposal_id: String,
	},
});
