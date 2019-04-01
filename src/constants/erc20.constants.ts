export enum METHOD_NAME {
	TRANSFER = 'transfer',
	TRANSFER_FROM = 'transferFrom',
	BALANCE_OF = 'balanceOf',
	TOTAL_SUPPLY = 'totalSupply',
	ALLOWANCE = 'allowance',
	APPROVE = 'approve',
	NAME = 'name',
	SYMBOL = 'symbol',
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
}

export const METHOD_RESULT_TYPE = {
	BALANCE_OF: ['uint256'],
	TOTAL_SUPPLY: ['uint256'],
	NAME: ['string'],
	SYMBOL: ['string'],
};

export const METHOD_MAP: { [x: string]: null | [METHOD_NAME, string[]] } = {
	[METHOD_HASH.TRANSFER]: [METHOD_NAME.TRANSFER, ['address', 'uint256']],
	[METHOD_HASH.TRANSFER_FROM]: [METHOD_NAME.TRANSFER_FROM, ['address', 'address', 'uint256']],
};

export const METHOD_HASH_LIST: METHOD_HASH[] = Object.values(METHOD_HASH);

export const METHOD = {
	NAME: METHOD_NAME,
	HASH: METHOD_HASH,
	HASH_LIST: METHOD_HASH_LIST,
	MAP: METHOD_MAP,
	RESULT_TYPE: METHOD_RESULT_TYPE,
};
