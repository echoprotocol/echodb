export enum EVENT {
	TEST = 'test',
	TEST2 = 'test2',
}

export type EVENT_PAYLOAD_TYPE = {
	[EVENT.TEST]: string;
	[EVENT.TEST2]: number;
};

export enum KEY {
	TEST = 'test',
}

export type  KEY_VALUE_TYPE = {
	[KEY.TEST]: string;
};

export enum CLIENT_ID {
	SUB,
	PUB,
	INFO,
}
