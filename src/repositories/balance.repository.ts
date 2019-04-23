import AbstractRepository from './abstract.repository';
import BalanceModel from '../models/balance.model';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import * as BALANCE from '../constants/balance.constants';
import * as REDIS from '../constants/redis.constants';
import { IBalance, IBalanceToken, IBalanceAsset } from '../interfaces/IBalance';
import { MongoId, TDoc } from '../types/mongoose';
import { BigNumber as BN } from 'bignumber.js';

export default class BalanceRepository extends AbstractRepository<IBalance<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
	) {
		super(ravenHelper, BalanceModel);
	}

	// Assets
	findByAccountAndAsset(accountId: MongoId, assetId: MongoId) {
		return <Promise<TDoc<IBalanceAsset>>>this.findOne({ _account: accountId, _asset: assetId });
	}

	async updateOrCreateByAccountAndAsset(
		accountId: MongoId,
		assetId: MongoId,
		amount: string,
		{ append = false } = {},
	) {
		const dBalance = await this.findByAccountAndAsset(accountId, assetId);
		if (!dBalance) return this.createByAccountAndAsset(accountId, assetId, amount);
		if (append) dBalance.amount = new BN(amount).plus(amount).toString();
		else dBalance.amount = amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	async createByAccountAndAsset(accountId: MongoId, assetId: MongoId, amount: string) {
		const dBalance = await super.create({
			amount,
			_account: accountId,
			_asset: assetId,
			type: BALANCE.TYPE.ASSET,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_BALANCE, dBalance);
		return dBalance;
	}

	// Tokens
	findByAccountAndContract(accountId: MongoId, contractId: MongoId) {
		return <Promise<TDoc<IBalanceToken>>>super.findOne({ _account: accountId, _contract: contractId });
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
		dBalance.amount = append ? new BN(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	async createByAccountAndContract(accountId: MongoId, contractId: MongoId, amount: string) {
		const dBalance = <TDoc<IBalanceToken>>await super.create({
			amount,
			_account: accountId,
			type: BALANCE.TYPE.TOKEN,
			_contract: contractId,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_BALANCE, dBalance);
		return dBalance;
	}

}
