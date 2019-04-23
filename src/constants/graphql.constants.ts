import * as REDIS from './redis.constants';
import { IBalanceExtended } from '../interfaces/IBalance';
import { ITransferExtended } from '../interfaces/ITransfer';
import { TDoc } from '../types/mongoose';
import { Overwrite } from '../types';
import { IContractBalanceExtended } from 'interfaces/IContractBalance';

export enum EVENT {
	NOT_REDIS_EVENT = 'asd',
}

type EVENT_PAYLOAD_CUSTOM = {
	[EVENT.NOT_REDIS_EVENT]: string;
};

type EVENT_PAYLOAD_OVERWRITE = {
	[REDIS.EVENT.NEW_BALANCE]: TDoc<IBalanceExtended>;
	[REDIS.EVENT.BALANCE_UPDATED]: TDoc<IBalanceExtended>;
	[REDIS.EVENT.NEW_TRANSFER]: TDoc<ITransferExtended>;
	[REDIS.EVENT.NEW_CONTRACT_BALANCE]: TDoc<IContractBalanceExtended>;
	[REDIS.EVENT.CONTRACT_BALANCE_UPDATED]: TDoc<IContractBalanceExtended>;
};

export type EVENT_PAYLOAD = EVENT_PAYLOAD_CUSTOM & Overwrite<REDIS.EVENT_PAYLOAD, EVENT_PAYLOAD_OVERWRITE>;
