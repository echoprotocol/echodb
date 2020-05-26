export interface ICommitteeOptions {
	status?: string;
	eth_address?: String;
	btc_public_key?: String;
	committee_member_id?: String;
	proposal_operation?: String;
	approves_count?: Number;
	last_status_change_time?: String;
	last_executed_operation?: String;
	last_executed_operation_id?: Number;
	proposal_id?: String;
}

export interface IAccount {
	id: string;
	registrar: string;
	network_fee_percentage: number;
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
	addresses: string[];
	concentration_balance_rate?: number;
	concentration_history_rate?: number;
	evm_address?: string;
	committee_options?: ICommitteeOptions;
}
