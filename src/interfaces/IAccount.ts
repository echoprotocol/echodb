export interface IAccount {
	id: string;
	membership_expiration_date: string;
	registrar: string;
	referrer: string;
	lifetime_referrer: string;
	network_fee_percentage: number;
	lifetime_referrer_fee_percentage: number;
	referrer_rewards_percentage: number;
	name: string;
	active: {
		weight_threshold: number;
		account_auths: unknown[];
		key_auths: unknown[][];
		address_auths: unknown[];
	};
	echorand_key: string;
	options: {
		voting_account: string;
		delegating_account: string;
		num_witness: number;
		num_committee: number;
		votes: unknown[];
		extensions: unknown[];
	};
	statistics: string;
	whitelisting_accounts: unknown[];
	blacklisting_accounts: unknown[];
	whitelisted_accounts: unknown[];
	blacklisted_accounts: unknown[];
	owner_special_authority: [number, {}];
	active_special_authority: [number, {}];
	top_n_control_flags: number;
}
