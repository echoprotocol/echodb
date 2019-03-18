export enum ASSET {
	ECHO = '1.3.0',
}

export enum OPERATION_ID {
	TRANSFER = 0,
	ACCOUNT_CREATE = 5,
	ACCOUNT_UPDATE = 6,
	ACCOUNT_WHITELIST = 7,
	ACCOUNT_TRANSFER = 9,
	CONTRACT_CREATE = 47,
	CONTRACT_CALL = 48,
}

export type Operations = {
	[OPERATION_ID.TRANSFER]: TranfserOperation;
	[OPERATION_ID.ACCOUNT_CREATE]: AccountCreateOperation;
	[OPERATION_ID.ACCOUNT_UPDATE]: AccountUpdateOperation;
	[OPERATION_ID.ACCOUNT_TRANSFER]: AccountTransferOperation;
	[OPERATION_ID.ACCOUNT_WHITELIST]: AccountWhitelistOperation;
	[OPERATION_ID.CONTRACT_CREATE]: ContractCreateOperation;
	[OPERATION_ID.CONTRACT_CALL]: ContractCallOperation;
};

export type OperationsResult = {
	[OPERATION_ID.TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_CREATE]: string;
	[OPERATION_ID.ACCOUNT_UPDATE]: string;
	[OPERATION_ID.ACCOUNT_TRANSFER]: string;
	[OPERATION_ID.ACCOUNT_WHITELIST]: unknown;
	[OPERATION_ID.CONTRACT_CREATE]: string;
	[OPERATION_ID.CONTRACT_CALL]: unknown;
};

export type OPERATION_PROPS = { [x in OPERATION_ID]: Operations[x] };
export type OPERATION_RESULT = { [x in OPERATION_ID]: OperationsResult[x] };

export type Authority = [number, {}];
type ExtensionsArr = unknown[];
type ExtensionsObj = {};
type Fee = {
	amount: number,
	asset_id: string,
};

interface TranfserOperation {
	fee: Fee;
	from: string;
	to: string;
	amount: {
		amount: number,
		asset_id: string,
	};
	extensions: ExtensionsArr;
	memo?: {
		from: string;
		to: string;
		nonce: string;
		message: string;
	};
}

export interface AccountPerson {
	weight_threshold: number;
	account_auths: unknown[];
	key_auths: unknown[][];
	address_auths: unknown[];
}

export interface AccountOptions {
	memo_key: string;
	voting_account: string;
	delegating_account: string;
	num_witness: number;
	num_committee: number;
	votes: unknown[];
	extensions: ExtensionsArr;
}

interface AccountCreateOperation {
	fee: Fee;
	registrar: string;
	referrer: string;
	referrer_percent: number;
	name: string;
	owner: AccountPerson;
	active: AccountPerson;
	options: AccountOptions;
	extensions: ExtensionsObj;
	ed_key: string;
	owner_special_authority?: Authority;
	active_special_authority?: Authority;
	buyback_options?: unknown;
}

interface AccountUpdateOperation {
	fee: Fee;
	account: string;
	owner?: AccountPerson;
	active?: AccountPerson;
	ed_key?: string;
	new_options?: AccountOptions;
	owner_special_authority?: Authority;
	active_special_authority?: Authority;
	extensions: ExtensionsObj;
}

interface AccountTransferOperation {
	fee: Fee;
	account_id: string;
	new_owner: string;
	extensions: ExtensionsArr;
}

export enum ACCOUNT_WHITELIST {
	NO_LISTING,
	WHITE_LISTED,
	BLACK_LISTED,
	WHITE_AND_BLACK_LISTED,
}

interface AccountWhitelistOperation {
	fee: Fee;
	authorizing_account: string;
	account_to_list: string;
	new_listing: ACCOUNT_WHITELIST;
	extensions: ExtensionsArr;
}

interface ContractCreateOperation {
	fee: Fee;
	registrar: string;
	value: {
		amount: number;
		asset_id: string;
	};
	code: string;
	supported_asset_id?: string;
	eth_accuracy: true;
}

interface ContractCallOperation {
	fee: Fee;
	registrar: string;
	value: {
		amount: number,
		asset_id: string,
	};
	code: string;
	callee: string;
}
