import AbstractModel from './abstract.model';
import * as MODEL from '../constants/model.constants';
import { IAccount } from '../interfaces/IAccount';
import { Schema } from 'mongoose';

export default AbstractModel<IAccount>(MODEL.NAME.ACCOUNT, {
	id: String,
	membership_expiration_date: String,
	registrar: String,
	referrer: String,
	lifetime_referrer: String,
	network_fee_percentage: Number,
	lifetime_referrer_fee_percentage: Number,
	referrer_rewards_percentage: Number,
	name: String,
	owner: {
		weight_threshold: Number,
		account_auths: [Schema.Types.Mixed],
		key_auths: [[Schema.Types.Mixed]],
	   address_auths: [Schema.Types.Mixed],
	},
	active: {
		weight_threshold: Number,
		account_auths: [Schema.Types.Mixed],
		key_auths: [[Schema.Types.Mixed]],
	   address_auths: [Schema.Types.Mixed],
	},
	ed_key: String,
	options: {
		memo_key: String,
		voting_account: String,
		delegating_account: String,
		num_witness: Number,
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
});
