import AccountRepository from '../../repositories/account.repository';
import AbstractRepository from '../../repositories/abstract.repository';
import ContractRepository from '../../repositories/contract.repository';
import AssetRepository from '../../repositories/asset.repository';
import RedisConnection from '../../connections/redis.connection';
import * as REDIS from '../../constants/redis.constants';
import * as BALANCE from '../../constants/balance.constants';
import { inline } from '../../utils/format';
import { getLogger } from 'log4js';
import { PubSub } from 'apollo-server-express';
import { EventEmitter } from 'events';
import { isMongoObjectId } from '../../utils/validators';
import { IBalance, IBalanceExtended } from '../../interfaces/IBalance';
import { TDoc } from '../../types/mongoose';
import { Payload as RedisPayload } from '../../types/redis';
import { Payload as GqlPayload } from '../../types/graphql';
import { ITransfer, ITransferExtended } from '../../interfaces/ITransfer';
import { IContractBalance, IContractBalanceExtended } from '../../interfaces/IContractBalance';
import { IAsset, IAssetExtended } from '../../interfaces/IAsset';

const logger = getLogger('pub.sub');

// FIXME: improve
export default class PubSubEngine extends EventEmitter {
	private pubSub = new PubSub({ eventEmitter: this });
	private registredRedisEvents: Set<REDIS.EVENT> = new Set<REDIS.EVENT>();

	get engine() { return this.pubSub; }

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private assetRepository: AssetRepository,
		private redisConnection: RedisConnection,
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
		this.redisConnection.on(event, async (payload: RedisPayload) => {
			logger.trace(`emitting "${event}"`);
			const gqlPayload = await this.transformPayload(event, payload);
			super.emit(event, gqlPayload);
		});
	}

	private transformPayload<T extends REDIS.EVENT>(event: T, payload: RedisPayload<T>): Promise<GqlPayload<T>> {
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

	private async transformAsset(dAsset: TDoc<IAsset>) {
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
