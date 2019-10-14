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
	addresses: [Schema.Types.Mixed],
});
