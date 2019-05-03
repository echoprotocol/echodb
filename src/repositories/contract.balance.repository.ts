import AbstractRepository from './abstract.repository';
import ContractBalanceModel from '../models/contract.balance.model';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import * as REDIS from '../constants/redis.constants';
import * as BALANCE from '../constants/balance.constants';
import { IContractBalance, IContractBalanceToken, IContractBalanceAsset } from '../interfaces/IContractBalance';
import { MongoId, TDoc } from '../types/mongoose';
import { BigNumber as BN } from 'bignumber.js';
import { IContract } from '../interfaces/IContract';
import { IAsset } from '../interfaces/IAsset';

export default class ContractBalanceRepository extends AbstractRepository<IContractBalance> {

	constructor(
		ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
	) {
		super(ravenHelper, ContractBalanceModel);
	}

	// Token
	findByOwnerAndContract(owner: MongoId<IContract>, contract: MongoId<IContract>) {
		return <Promise<TDoc<IContractBalanceToken>>>super.findOne({ _owner: owner, _contract: contract });
	}

	async createByOwnerAndContract(owner: MongoId<IContract>, contract: MongoId<IContract>, amount: string) {
		const dBalance = await super.create({
			amount,
			_owner: owner,
			_contract: contract,
			type: BALANCE.TYPE.TOKEN,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_CONTRACT_BALANCE, dBalance);
		return dBalance;
	}

	async updateOrCreateByOwnerAndContract(
		owner: MongoId<IContract>,
		contract: MongoId<IContract>,
		amount: string,
		{ append = false } = {},
	) {
		// const dBalance = await this.findOne({ _owner: owner, _contract: contract });
		const dBalance = await this.findByOwnerAndContract(owner, contract);
		if (!dBalance) {
			return this.createByOwnerAndContract(owner, contract, amount);
		}
		dBalance.amount = append ? new BN(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.CONTRACT_BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	// Asset
	findByOwnerAndAsset(owner: MongoId<IContract>, asset: MongoId<IAsset>) {
		return <Promise<TDoc<IContractBalanceAsset>>>super.findOne({ _owner: owner, _asset: asset });
	}

	async createByOwnerAndAsset(owner: MongoId<IContract>, asset: MongoId<IAsset>, amount: string) {
		const dBalance = await super.create({
			amount,
			_owner: owner,
			_asset: asset,
			type: BALANCE.TYPE.ASSET,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_CONTRACT_BALANCE, dBalance);
		return dBalance;
	}

	async updateOrCreateByOwnerAndAsset(
		owner: MongoId<IContract>,
		asset: MongoId<IAsset>,
		amount: string,
		{ append = false } = {},
	) {
		// const dBalance = await this.findOne({ _owner: owner, _asset: asset });
		const dBalance = await this.findByOwnerAndAsset(owner, asset);
		if (!dBalance) {
			return this.createByOwnerAndAsset(owner, asset, amount);
		}
		dBalance.amount = append ? new BN(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.CONTRACT_BALANCE_UPDATED, dBalance);
		return dBalance;

	}

}
