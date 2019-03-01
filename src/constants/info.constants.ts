export enum KEY {
	LAST_PARSED_BLOCK_NUMBER = 'last_block_number',
}

export const DEFAULT_VALUE: { [x in KEY]: unknown} = {
	[KEY.LAST_PARSED_BLOCK_NUMBER]: 0,
};

export type KEY_TYPE =  {
	[KEY.LAST_PARSED_BLOCK_NUMBER]: number;
};
