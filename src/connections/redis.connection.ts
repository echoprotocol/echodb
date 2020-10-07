import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TDoc } from '../types/mongoose';
import { isMongoObjectId } from '../utils/validators';
import AbstractConnection from './abstract.connection';
// import ConnectionError from '../errors/connection.error';
import RavenHelper from '../helpers/raven.helper';
import AbstractRepository from '../repositories/abstract.repository';
import AccountRepository from '../repositories/account.repository';
import ContractRepository from '../repositories/contract.repository';
import AssetRepository from '../repositories/asset.repository';
import { IBalance, IBalanceExtended } from '../interfaces/IBalance';
import { ITransfer, ITransferExtended } from '../interfaces/ITransfer';
import { IContractBalance, IContractBalanceExtended } from '../interfaces/IContractBalance';
import { IAssetExtended } from '../interfaces/IAsset';
import * as config from 'config';
import * as redis from 'redis';
import * as REDIS from '../constants/redis.constants';
import * as BALANCE from '../constants/balance.constants';

import { Payload as RedisPayload } from '../types/redis';
import { Payload as GqlPayload } from '../types/graphql';

import { getLogger } from 'log4js';

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
	[x in REDIS.EVENT]?: Callback<RedisPayload<x>>[];
};

// const ERROR = {
// 	MESSAGE_INVALID_CHANNEL_NAME: 'incoming message invalid channel name',
// 	INVALID_PARAM_TYPE: 'invalid parameter type',
// 	INVALID_JSON: 'invalid json',
// 	CAN_NOT_EMIT: 'can not emit an event',
// };

export default class RedisConnection extends AbstractConnection {
	private subClient: redis.RedisClient | null = null;
	private pubClient: redis.RedisClient | null = null;
	private infoClient: redis.RedisClient | null = null;
	private pubSub: RedisPubSub | null = null;
	private events: EventsMap = {};
	get channelName() { return config.redis.channel; }
	get connectHost() { return config.redis.host; }
	get engine() { return this.pubSub; }

	constructor(
		readonly ravenHelper: RavenHelper,
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private assetRepository: AssetRepository,
	) {
		super();
		console.log('RedisConnection constructor');
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
		console.log('RedisConnection createClients');

		([this.subClient, this.pubClient, this.infoClient] = await Promise.all([
			this.createClient(REDIS.CLIENT_ID.SUB),
			this.createClient(REDIS.CLIENT_ID.PUB),
			this.createClient(REDIS.CLIENT_ID.INFO),
		]));
		this.pubSub = new RedisPubSub({ publisher: this.pubClient, subscriber: this.subClient });
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
		logger.error(error);
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

	async emit<T extends REDIS.EVENT>(event: T, payload: RedisPayload<T>) {
		// try {
		
		// } catch {
		// 	throw new ConnectionError(ERROR.CAN_NOT_EMIT)
		// }
		console.log('emit123', event, payload);
		await this.pubSub.publish(this.channelName, { event, payload });
	}

	private async processMessage(message: string) {
		try {
			const { event, payload }: Message = JSON.parse(message);
			// if (typeof event !== 'string' || !(event in REDIS.EVENT)) return;
			const rEvent = <REDIS.EVENT>event;
			// const gqlPayload = await this.transformPayload(rEvent, payload);
			if (!this.events[rEvent]) return;
			for (const cb of this.events[rEvent]) cb(payload);
		} catch (_) {
			return;
		}
	}

	public async transformPayload<T extends REDIS.EVENT>(event: T, payload: RedisPayload<T>): Promise<GqlPayload<T>> {
		switch (event) {
			case REDIS.EVENT.NEW_BALANCE:
			case REDIS.EVENT.BALANCE_UPDATED:
				return this.transformBalance(
					<RedisPayload<REDIS.EVENT.NEW_BALANCE | REDIS.EVENT.BALANCE_UPDATED>>payload,
				);
			case REDIS.EVENT.NEW_CONTRACT_BALANCE:
			case REDIS.EVENT.CONTRACT_BALANCE_UPDATED:
				return this.transformContractBalance(
					<RedisPayload<REDIS.EVENT.NEW_CONTRACT_BALANCE | REDIS.EVENT.CONTRACT_BALANCE_UPDATED>>payload,
				);
			case REDIS.EVENT.NEW_TRANSFER:
				return this.transformTransfer(
					<RedisPayload<REDIS.EVENT.NEW_TRANSFER>>payload,
				);
			case REDIS.EVENT.NEW_ASSET:
				return this.transformAsset(
					<RedisPayload<REDIS.EVENT.NEW_ASSET>>payload,
				);
			default:
				return <GqlPayload>payload;
		}
	}

	private async transformBalance(dBalance: TDoc<IBalance>): Promise<TDoc<IBalanceExtended>> {
		await this.resolveRelationField(dBalance, '_account', this.accountRepository);
		if (dBalance.type === BALANCE.TYPE.TOKEN) {
			await this.resolveRelationField(dBalance, '_contract', this.contractRepository);
		}
		if (dBalance.type === BALANCE.TYPE.ASSET) {
			await this.resolveRelationField(dBalance, '_asset', this.assetRepository);
		}
		return <TDoc<IBalanceExtended>>dBalance;
	}

	private async transformTransfer(dTransfer: TDoc<ITransfer>): Promise<TDoc<ITransferExtended>> {
		await this.resolveRelationField(dTransfer, '_fromAccount', this.accountRepository);
		await this.resolveRelationField(dTransfer, '_fromContract', this.contractRepository);
		await this.resolveRelationField(dTransfer, '_toAccount', this.accountRepository);
		await this.resolveRelationField(dTransfer, '_toContract', this.contractRepository);
		if (dTransfer.valueType === BALANCE.TYPE.TOKEN) {
			await this.resolveRelationField(dTransfer, '_contract', this.contractRepository);
		}
		if (dTransfer.valueType === BALANCE.TYPE.ASSET) {
			await this.resolveRelationField(dTransfer, '_asset', this.assetRepository);
		}
		return <TDoc<ITransferExtended>>dTransfer;
	}

	private async transformAsset(dAsset: RedisPayload<REDIS.EVENT.NEW_ASSET>) {
		if (isMongoObjectId(dAsset._account)) {
			dAsset._account = await this.accountRepository.findByMongoId(dAsset._account);
		}
		return <TDoc<IAssetExtended>>dAsset;
	}

	private async transformContractBalance(dBalance: TDoc<IContractBalance>): Promise<TDoc<IContractBalanceExtended>> {
		await this.resolveRelationField(dBalance, '_owner', this.contractRepository);
		return <TDoc<IContractBalanceExtended>>dBalance;
	}

	private async resolveRelationField<T extends { [x: string]: any }>(
		body: T, field: keyof T, repository: AbstractRepository,
	) {
		const value = body[field];
		if (!value || !isMongoObjectId(value)) return;
		body[field] = <T[keyof T]>await repository.findByMongoId(value);
	}

}
