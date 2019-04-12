import AbstractRepository from './abstract.repository';
import BalanceModel from '../models/balance.model';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import * as BALANCE from '../constants/balance.constants';
import * as REDIS from '../constants/redis.constants';
import { IBalance, IBalanceTokenDocument } from '../interfaces/IBalance';
import { MongoId } from '../types/mongoose';
import BigNumber from 'bignumber.js';

export default class BalanceRepository extends AbstractRepository<IBalance<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
	) {
		super(ravenHelper, BalanceModel);
	}

	// Tokens
	findByAccountAndContract(accountId: MongoId, contractId: MongoId): Promise<IBalanceTokenDocument> {
		return <Promise<IBalanceTokenDocument>>super.findOne({ _account: accountId, _contract: contractId });
	}

	async updateOrCreateByAccountAndContract(
		accountId: MongoId,
		contractId: MongoId,
		amount: string,
		{ append = false } = {},
	) {
		const dBalance = await this.findByAccountAndContract(accountId, contractId);
		if (!dBalance) {
			return this.createByAccountAndContract(accountId, contractId, amount);
		}
		dBalance.amount = append ? new BigNumber(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	async createByAccountAndContract(accountId: MongoId, contractId: MongoId, amount: string) {
		const dBalance = <IBalanceTokenDocument>await super.create({
			amount,
			_account: accountId,
			type: BALANCE.TYPE.TOKEN,
			_contract: contractId,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_BALANCE, dBalance);
		return dBalance;
	}

}
