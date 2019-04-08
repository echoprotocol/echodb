import RedisConnection from 'connections/redis.connection';
import * as REDIS from '../../constants/redis.constants';
import { inline } from '../../utils/format';
import { getLogger, shutdown } from 'log4js';
import { PubSubEngine as IPubSubEngine } from 'type-graphql';
// FIXME: configure logger to separate file
const logger = getLogger('pub.sub');

// TODO: use debug lib to show time
export class PubSubEngine implements IPubSubEngine {

	private increment = 0;
	private handlers = new Map<number, { event: string, cb: Function }>();
	private events = new Map<string, Set<number>>();

	constructor(
		private redisConnection: RedisConnection,
	) {}

	async publish(event: string, payload: any): Promise<void> {
		// FIXME: inline ${payload}
		logger.info(`publishing event "${event}" with payload "${payload}"`);
		const handlersIds = this.events.get(event);
		if (!handlersIds) {
			logger.warn('no subscribers, returning');
			return;
		}
		for (const handlerId of handlersIds) {
			const cb = this.handlers.get(handlerId).cb;
			logger.warn(`calling cb "${cb}"`);
			cb(payload);
		}
		logger.trace('publishing finished');
	}

	async subscribe(event: string, cb: Function): Promise<number> {
		logger.info(inline(`subscribing for event "${event}" with cb "${cb}"`));
		const id = this.increment;
		this.increment += 1;
		this.handlers.set(id, { event, cb });
		if (!this.events.has(event)) {
			logger.warn('first cb for the event, creating new set');
			this.events.set(event, new Set<number>());
		}
		this.events.get(event).add(id);

		if (REDIS.EVENT_LIST.includes(event)) {
			logger.warn('event in redis event, subscribing in redis');
			// TODO: check types
			this.redisConnection.on(<REDIS.EVENT>event, <any>cb);
		}

		logger.trace(`subscribing finished, id "${id}"`);
		// console.log('subscribe', id);
		return id;
	}

	unsubscribe(id: number): void {
		// console.log('unsubscribe', id);
		logger.info(`unsubscribing for id "${id}"`);
		if (!this.handlers.has(id)) {
			logger.warn('no subscriptions found, returning');
			console.log('EXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXIT');
			console.log('EXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXIT');
			console.log('EXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXIT');
			console.log('EXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXITEXIT');
			shutdown(() => process.exit(0));
			return;
		}
		const { event } = this.handlers.get(id);
		this.handlers.delete(id);
		const eventIdSet = this.events.get(event);
		eventIdSet.delete(id);
		if (eventIdSet.size === 0) {
			logger.warn('unsubscribing last cb from the event, deleting event set');
			this.events.delete(event);
		}

		if (REDIS.EVENT_LIST.includes(event)) {
			logger.warn('event is redis event, unsubscribing in redis');
			// FIXME: add cb
			// @ts-ignore
			this.redisConnection.unsubscribe(event);
		}

		logger.trace('unsubscribing finished');
	}

	async *asyncIterator<T>(events: string | string[]): AsyncIterator<T> {
		events = events instanceof Array ? events : [events];
		while (true) {
			console.log('CYCLE');
			for (const event of events) {
				yield new Promise<T>(async (resolve) => {
					let res: Function = null;
					const promise = new Promise<T>((res1) => { res = res1; });
					const id = await this.subscribe(event, (payload: T) => res(payload));
					console.log('subed', id);
					const result = await promise;
					this.unsubscribe(id);
					resolve(result);
				});
			}
		}
	}

	// async *asyncIterator<T>(events: string | string[]): AsyncIterator<T> {
	// 	events = events instanceof Array ? events : [events];
	// 	while (true) {
	// 		console.log('CYCLE');
	// 		for (const event of events) {
	// 			yield new Promise<T>(async (resolve) => {
	// 				let res: Function = null;
	// 				const promise = new Promise<T>((res1) => { res = res1; });
	// 				const id = await this.subscribe(event, (payload: T) => res(payload));
	// 				console.log('subed', id);
	// 				const result = await promise;
	// 				this.unsubscribe(id);
	// 				resolve(result);
	// 			});
	// 		}
	// 	}
	// }
}
