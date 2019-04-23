import AbstractRepository from './abstract.repository';
import ContractBalanceModel from '../models/contract.balance.model';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import * as REDIS from '../constants/redis.constants';
import { IContractBalance } from '../interfaces/IContractBalance';
import { ContractId, AssetId } from '../types/echo';
import { MongoId } from '../types/mongoose';
import { BigNumber as BN } from 'bignumber.js';

export default class ContractBalanceRepository extends AbstractRepository<IContractBalance> {

	constructor(
		ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
	) {
		super(ravenHelper, ContractBalanceModel);
	}

	findById(id: ContractId) {
		return super.findOne({ id });
	}

	async updateOrCreate(
		contractId: MongoId,
		assetEchoId: AssetId,
		amount: string,
		{ append = false } = {},
	) {
		const dBalance = await this.findOne({ _contract: contractId, asset: assetEchoId });
		if (!dBalance) {
			return this.fastCreate(contractId, assetEchoId, amount);
		}
		dBalance.amount = append ? new BN(dBalance.amount).plus(amount).toString() : amount;
		await dBalance.save();
		this.redisConnection.emit(REDIS.EVENT.CONTRACT_BALANCE_UPDATED, dBalance);
		return dBalance;
	}

	async fastCreate(contractId: MongoId, assetEchoId: AssetId, amount: string) {
		const dBalance = await super.create({
			amount,
			_contract: contractId,
			asset: assetEchoId,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_CONTRACT_BALANCE, dBalance);
		return dBalance;
	}

}
