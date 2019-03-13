export enum OPERATION_ID {
	TRANSFER = 0,
	ACCOUNT_CREATE = 5,
	ACCOUNT_UPDATE = 6,
	ACCOUNT_WHITELIST = 7,
	ACCOUNT_TRANSFER = 9,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TranfserOperation;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_TRANSFER]: AccountTransferOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
};

export type OperationsResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
};

export type OPERATION_PROPS = { [x in OPERATION_ID]: Operations[x] };
export type OPERATION_RESULT = { [x in OPERATION_ID]: OperationsResult[x] };

type ExtensionsArr = unknown[];
type ExtensionsObj = {};
type Fee = {
	amount: number,
	asset_id: string,
};

type TranfserOperation = {
	fee: Fee,
	from: string,
	to: string,
	amount: {
		amount: number,
		asset_id: string,
	},
	extenstions: ExtensionsArr,
	memo? : {
		from: string,
		to: string,
		nonce: string,
		message: string,
	},
};

type AccountCreateOperation = {
	fee: Fee,
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
		extenstions: ExtensionsArr,
	},
	extensions: ExtensionsObj,
};

type AccountUpdateOperation = {
	fee: Fee,
	registrar: string,
	referrer: string,
	referrer_percent: number,
	account: string;
	ed_key: string;
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
	extensions: ExtensionsObj,
};

type AccountTransferOperation = {
	fee: Fee,
	account_id: string;
	new_owner: string;
	extensions: ExtensionsArr,
};

export enum ACCOUNT_WHITELIST {
	NO_LISTING,
	WHITE_LISTED,
	BLACK_LISTED,
	WHITE_AND_BLACK_LISTED,
}

type AccountWhitelistOperation = {
	fee: Fee;
	authorizing_account: string;
	account_to_list: string;
	new_listing: ACCOUNT_WHITELIST,
	extensions: ExtensionsArr;
};
