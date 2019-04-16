import AccountRepository from '../../repositories/account.repository';
import ContractRepository from 'repositories/contract.repository';
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

const logger = getLogger('pub.sub');

// FIXME: improve
export default class PubSubEngine extends EventEmitter {
	private pubSub = new PubSub({ eventEmitter: this });
	private registredRedisEvents: Set<REDIS.EVENT> = new Set<REDIS.EVENT>();

	get engine() { return this.pubSub; }

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
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
					<RedisPayload<REDIS.EVENT.NEW_BALANCE|REDIS.EVENT.BALANCE_UPDATED>>payload,
				);
			default:
				return <GqlPayload>payload;
		}
	}

	private async transformBalance(dBalance: TDoc<IBalance>): Promise<TDoc<IBalanceExtended>> {
		if (isMongoObjectId(dBalance._account)) {
			dBalance._account = await this.accountRepository.findByMongoId(dBalance._account);
		}
		if (dBalance.type === BALANCE.TYPE.TOKEN) {
			if (isMongoObjectId(dBalance._contract)) {
				dBalance._contract = await this.contractRepository.findByMongoId(dBalance._contract);
			}
		}
		return <TDoc<IBalanceExtended>>dBalance;
	}

}
