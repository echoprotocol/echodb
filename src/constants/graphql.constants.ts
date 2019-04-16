import * as REDIS from './redis.constants';
import { IBalanceExtended } from '../interfaces/IBalance';
import { TDoc } from '../types/mongoose';
import { Overwrite } from '../types';

export enum EVENT {
	NOT_REDIS_EVENT = 'asd',
}

type EVENT_PAYLOAD_CUSTOM = {
	[EVENT.NOT_REDIS_EVENT]: string;
};

type EVENT_PAYLOAD_OVERWRITE = {
	[REDIS.EVENT.NEW_BALANCE]: TDoc<IBalanceExtended>;
	[REDIS.EVENT.BALANCE_UPDATED]: TDoc<IBalanceExtended>;
};

export type EVENT_PAYLOAD = EVENT_PAYLOAD_CUSTOM & Overwrite<REDIS.EVENT_PAYLOAD, EVENT_PAYLOAD_OVERWRITE>;
