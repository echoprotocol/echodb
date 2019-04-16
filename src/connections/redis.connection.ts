import * as config from 'config';
import * as redis from 'redis';
import { promisify } from 'util';
import { getLogger } from 'log4js';
import AbstractConnection from './abstract.connection';
import RavenHelper from '../helpers/raven.helper';
import * as REDIS from '../constants/redis.constants';
import ConnectionError from '../errors/connection.error';
import { Payload } from '../types/redis';

const logger = getLogger('redis.connection');
// FIXME: rm declare
// FIXME: implement unsubscribing
// FIXME: use maps
declare interface Message {
	event: unknown;
	payload: any;
}
export declare type Callback<T> = (payload: T) => void | Promise<void>;
declare type EventsMap = {
	[x in REDIS.EVENT]?: Callback<Payload<x>>[];
};

const ERROR = {
	MESSAGE_INVALID_CHANNEL_NAME: 'incoming message invalid channel name',
	INVALID_PARAM_TYPE: 'invalid parameter type',
	INVALID_JSON: 'invalid json',
	CAN_NOT_EMIT: 'can not emit an event',
};

export default class RedisConnection extends AbstractConnection {
	private subClient: redis.RedisClient | null = null;
	private pubClient: redis.RedisClient | null = null;
	private infoClient: redis.RedisClient | null = null;
	private events: EventsMap = {};
	get channelName() { return config.redis.channel; }
	get connectHost() { return config.redis.host; }

	constructor(
		readonly ravenHelper: RavenHelper,
	) {
		super();
	}

	private get clients() {
		return [this.subClient, this.pubClient, this.infoClient];
	}
	async connect() {
		await this.createClients();
		await this.subscribeToChannel(this.channelName);
	}

	disconnect() {
		for (const client of this.clients) client.shutdown();
	}

	private async createClients() {
		([this.subClient, this.pubClient, this.infoClient] = await Promise.all([
			this.createClient(REDIS.CLIENT_ID.SUB),
			this.createClient(REDIS.CLIENT_ID.PUB),
			this.createClient(REDIS.CLIENT_ID.INFO),
		]));
	}

	private async createClient(clientId: REDIS.CLIENT_ID): Promise<redis.RedisClient> {
		return new Promise((resolve) => {
			const client = redis.createClient({
				host: config.redis.host,
			});
			client.on('error', (error) => { this.handleClientError(clientId, error); });
			client.on('connect', () => { resolve(client); });
		});

	}

	private handleClientError(clientId: REDIS.CLIENT_ID, error: Error) {
		this.ravenHelper.error(
			error,
			'redis#handleClientError',
			{ clientId },
		);
	}

	private async subscribeToChannel(channelName: string) {
		// get subscription peers here if needed
		await new Promise((resolve) => {
			this.subClient.on('subscribe', () => resolve());
			this.subClient.subscribe(channelName);
		});
		await this.subscribeToMessages();
	}

	private async subscribeToMessages() {
		this.subClient.on('message', (channelName, message) => {
			if (channelName !== this.channelName) return;
			this.processMessage(message);
		});
	}

	on<T extends REDIS.EVENT>(event: T, cb: Callback<Payload<T>>) {
		if (!this.events[event]) this.events[event] = [cb];
		else this.events[event].push(cb);
	}

	// @ts-ignore
	unsubscribe<T extends REDIS.EVENT>(event: T, cb: Callback<Payload<T>>) {
		logger.warn('unsubscribing is not implemented');
	}

	// TODO: make it async (use third parameter(cb) in publish(...))
	async emit<T extends REDIS.EVENT>(event: T, payload: Payload<T>) {
		const result = await promisify((cb) =>
			this.pubClient.publish(this.channelName, JSON.stringify({ event, payload }), cb))();
		if (!result) throw new ConnectionError(ERROR.CAN_NOT_EMIT);
		return result;
	}

	async get<T extends REDIS.KEY>(key: T): Promise<REDIS.KEY_VALUE_TYPE[T]> {
		try {
			return <any>await promisify((cb) => this.infoClient.get(key, cb));
		} catch (error) {
			logger.error(error);
			throw this.ravenHelper.error(
				error,
				'redisConnection#get',
				{ key, db: this.channelName },
			);
		}
	}

	// TODO: stringify value
	async set<T extends REDIS.KEY>(key: T, value: REDIS.KEY_VALUE_TYPE[T]) {
		try {
			await promisify((cb) => this.infoClient.set(key, value, cb));
		} catch (error) {
			throw this.ravenHelper.error(
				error,
				'ravenConnection#set',
				{ key, value, db: this.channelName },
			);
		}
	}

	// TODO: forms ???
	private async processMessage(message: string) {
		try {
			const { event, payload }: Message = JSON.parse(message);
			// if (typeof event !== 'string' || !(event in REDIS.EVENT)) return;
			const rEvent = <REDIS.EVENT>event;
			if (!this.events[rEvent]) return;
			for (const cb of this.events[rEvent]) cb(payload);
		} catch (_) {
			return;
		}
	}

}
