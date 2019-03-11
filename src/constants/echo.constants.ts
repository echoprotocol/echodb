export enum OPERATION_ID {
	TRANSFER = 0,
	ACCOUNT_CREATE = 5,
	ACCOUNT_UPDATE = 6,
}

export type OPERATIONS = {
	[OPERATION_ID.TRANSFER]: TRANSFER;
	[OPERATION_ID.ACCOUNT_CREATE]: ACCOUNT_CREATE;
	[OPERATION_ID.ACCOUNT_UPDATE]: ACCOUNT_UPDATE;
};

export type OPERATIONS_RESULT = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
};

export type OPERATION_PROPS = { [x in OPERATION_ID]: OPERATIONS[x] };
export type OPERATION_RESULT = { [x in OPERATION_ID]: OPERATIONS_RESULT[x] };

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

type ACCOUNT_UPDATE = {
	fee: {
		amount: number,
		asset_id: string,
	},
	registrar: string,
	referrer: string,
	referrer_percent: number,
	account: string;
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
	new_options: {
		memo_key: string,
		voting_account: string,
		num_witness: number,
		num_committee: number,
		votes: unknown[],
		extenstions: [],
	},
	extensions: {},
};
