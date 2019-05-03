import AbstractRepository from './abstract.repository';
import BalanceModel from '../models/balance.model';
import BN from 'bignumber.js';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import * as BALANCE from '../constants/balance.constants';
import * as REDIS from '../constants/redis.constants';
import { IBalance, IBalanceToken, IBalanceAsset } from '../interfaces/IBalance';
import { MongoId, TDoc } from '../types/mongoose';
import { IAccount } from '../interfaces/IAccount';
import { IContract } from '../interfaces/IContract';
import { IAsset } from '../interfaces/IAsset';

export default class BalanceRepository extends AbstractRepository<IBalance<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
	) {
		super(ravenHelper, BalanceModel);
	}

	// Assets
	findByAsset(asset: MongoId<IAsset>) {
		return <Promise<TDoc<IBalanceAsset>[]>>super.find({ _asset: asset });
	}

	findByAccountAndAsset(accountId: MongoId<IAccount>, asset: MongoId<IAsset>) {
		return <Promise<TDoc<IBalanceAsset>>>this.findOne({ _account: accountId, _asset: asset });
	}

	async updateOrCreateByAccountAndAsset(
		account: MongoId<IAccount>,
		asset: MongoId<IAsset>,
		amount: string,
		{ append = false },
	) {
		const dBalance = await this.findByAccountAndAsset(account, asset);
		if (!dBalance) return this.createByAccountAndAsset(account, asset, amount);
		dBalance.amount = append ? new BN(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	async createByAccountAndAsset(account: MongoId<IAccount>, asset: MongoId<IAsset>, amount: string) {
		const dBalance = <TDoc<IBalanceAsset>>await super.create({
			amount,
			_account: account,
			_asset: asset,
			type: BALANCE.TYPE.ASSET,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_BALANCE, dBalance);
		return dBalance;
	}

	// Tokens
	findByAccountAndContract(account: MongoId<IAccount>, contract: MongoId<IContract>) {
		return <Promise<TDoc<IBalanceToken>>>super.findOne({ _account: account, _contract: contract });
	}

	async updateOrCreateByAccountAndContract(
		account: MongoId<IAccount>,
		contract: MongoId<IContract>,
		amount: string,
		{ append = false } = {},
	) {
		const dBalance = await this.findByAccountAndContract(account, contract);
		if (!dBalance) {
			return this.createByAccountAndContract(account, contract, amount);
		}
		dBalance.amount = append ? new BN(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	async createByAccountAndContract(account: MongoId<IAccount>, contract: MongoId<IContract>, amount: string) {
		const dBalance = <TDoc<IBalanceToken>>await super.create({
			amount,
			_account: account,
			_contract: contract,
			type: BALANCE.TYPE.TOKEN,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_BALANCE, dBalance);
		return dBalance;
	}

}
