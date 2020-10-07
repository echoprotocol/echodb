
import RedisConnection from '../../connections/redis.connection';
export default class PubSubEngine {

	get engine() { return this.redisConnection.engine; }

	constructor(
		private redisConnection: RedisConnection,
	) {
	}

}
