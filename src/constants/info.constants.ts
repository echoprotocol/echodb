export enum KEY {
	BLOCK_TO_PARSE_NUMBER = 'block_to_parse_number',
}

export const DEFAULT_VALUE: { [x in KEY]: unknown} = {
	[KEY.BLOCK_TO_PARSE_NUMBER]: 0,
};

export type KEY_TYPE =  {
	[KEY.BLOCK_TO_PARSE_NUMBER]: number;
};
