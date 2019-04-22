import * as GQL from '../../constants/graphql.constants';
import * as REDIS from '../../constants/redis.constants';

export type Payload<T extends GQL.EVENT | REDIS.EVENT = GQL.EVENT & REDIS.EVENT> = GQL.EVENT_PAYLOAD[T];
