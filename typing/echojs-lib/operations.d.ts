import { OPERATION_ID } from 'echojs-lib/types/constants/operations-ids';

type TRANSFER = {
	fee: {
		amount: number,
		asset_id: string,
	},
	from: string,
	to: string,
	amount: {
		amount: number,
		asset_id: string,
	},
	extenstions: unknown[],
	memo? : {
		from: string,
		to: string,
		nonce: string,
		message: string,
	},
};

type ACCOUNT_CREATE = {
	fee: {
		amount: number,
		asset_id: string,
	},
	registrar: string,
	referrer: string,
	referrer_percent: number,
	name: string,
	owner: {
		weight_threshold: number,
		account_auths: unknown[],
		key_auths: unknown[],
		address_auths: unknown[],
	},
	active: {
		weight_threshold: number,
		account_auths: unknown[],
		key_auths: unknown[],
		address_auths: unknown[],
	},
	options: {
		memo_key: string,
		voting_account: string,
		num_witness: number,
		num_committee: number,
		votes: unknown[],
		extenstions: [],
	},
	extensions: {},
};

type OPERATIONS = {
	[OPERATIONS_IDS.TRANSFER]: TRANSFER;
	[OPERATIONS_IDS.ACCOUNT_CREATE]: ACCOUNT_CREATE;
};

declare module 'echojs-lib/types/echo/transaction' {
	export type OPERATION_PROPS = { [x in OPERATIONS_IDS]: OPERATIONS[x] };
}
