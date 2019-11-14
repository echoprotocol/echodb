export enum METHOD_NAME {
	TRANSFER = 'transfer',
	TRANSFER_FROM = 'transferFrom',
	BALANCE_OF = 'balanceOf',
	TOTAL_SUPPLY = 'totalSupply',
	ALLOWANCE = 'allowance',
	APPROVE = 'approve',
	NAME = 'name',
	SYMBOL = 'symbol',
	DECIMALS = 'decimals',
}

export enum METHOD_HASH {
	TRANSFER = 'a9059cbb',
	TRANSFER_FROM = '23b872dd',
	TOTAL_SUPPLY = '18160ddd',
	BALANCE_OF = '70a08231',
	ALLOWANCE = 'dd62ed3e',
	APPROVE = '095ea7b3',
	NAME = '06fdde03',
	SYMBOL = '95d89b41',
	DECIMALS = '313ce567',
}

export const METHOD_RESULT_TYPE = {
	BALANCE_OF: ['uint256'],
	TOTAL_SUPPLY: ['uint256'],
	NAME: ['string'],
	SYMBOL: ['string'],
	DECIMALS: ['uint8'],
};

export const METHOD_MAP: { [x: string]: null | [METHOD_NAME, string[]] } = {
	[METHOD_HASH.TRANSFER]: [METHOD_NAME.TRANSFER, ['address', 'uint256']],
	[METHOD_HASH.TRANSFER_FROM]: [METHOD_NAME.TRANSFER_FROM, ['address', 'address', 'uint256']],
};

export const METHOD_HASH_LIST: METHOD_HASH[] = Object.values(METHOD_HASH);

export const METHOD_REQUIRED_HASH_LIST: METHOD_HASH[] = [
	METHOD_HASH.TRANSFER,
	METHOD_HASH.TRANSFER_FROM,
	METHOD_HASH.TOTAL_SUPPLY,
	METHOD_HASH.BALANCE_OF,
	METHOD_HASH.ALLOWANCE,
	METHOD_HASH.APPROVE,
];

export const METHOD = {
	NAME: METHOD_NAME,
	HASH: METHOD_HASH,
	HASH_LIST: METHOD_HASH_LIST,
	REQUIRED_HASH_LIST: METHOD_REQUIRED_HASH_LIST,
	MAP: METHOD_MAP,
	RESULT_TYPE: METHOD_RESULT_TYPE,
};

// Events
export enum EVENT_NAME {
	TRANSFER = 'Transfer',
	APPROVAL = 'Approval',
}

export enum EVENT_HASH {
	TRANSFER = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
	APPROVAL = '8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
}

export const EVENT_HASH_LIST = Object.values(EVENT_HASH);

export const EVENT_RESULT = {
	[EVENT_NAME.TRANSFER]: ['address', 'address', 'uint256'],
	[EVENT_NAME.APPROVAL]: ['address', 'address', 'uint256'],
};
