import * as REDIS from '../../constants/redis.constants';

export type Payload<T extends REDIS.EVENT = REDIS.EVENT> = REDIS.EVENT_PAYLOAD[T];
