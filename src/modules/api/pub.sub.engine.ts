import RedisConnection from 'connections/redis.connection';
import * as REDIS from '../../constants/redis.constants';
import { inline } from '../../utils/format';
import { getLogger } from 'log4js';
import { PubSub } from 'apollo-server-express';
import { EventEmitter } from 'events';
// FIXME: configure logger to separate file
const logger = getLogger('pub.sub');

// FIXME: improve
export default class PubSubEngine extends EventEmitter {
	private pubSub = new PubSub({ eventEmitter: this });
	private registredRedisEvents: Set<REDIS.EVENT> = new Set<REDIS.EVENT>();

	get engine() { return this.pubSub; }

	constructor(
		readonly redisConnection: RedisConnection,
	) {
		super();
	}

	addListener(event: string, listener: (...args: any[]) => void): this {
		logger.info(inline(`subscribing to "${event}" with cb "${listener}"`));
		if (REDIS.EVENT_LIST.includes(event)) this.registerRedisEvent(<REDIS.EVENT>event);
		super.addListener(event, listener);
		return this;
	}

	private registerRedisEvent(event: REDIS.EVENT) {
		if (this.registredRedisEvents.has(event)) return;
		logger.info(`register redis event "${event}"`);
		this.registredRedisEvents.add(event);
		this.redisConnection.on(event, (payload: any) => {
			logger.trace(`emitting "${event}"`);
			this.emit(event, payload);
		});
	}

}
