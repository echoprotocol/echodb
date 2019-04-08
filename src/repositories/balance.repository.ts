import AbstractRepository from './abstract.repository';
import BalanceModel from '../models/balance.model';
import RavenHelper from 'helpers/raven.helper';
import * as BALANCE from '../constants/balance.constants';
import { IBalance, IBalanceTokenDocument, IBalanceAssetDocument } from 'interfaces/IBalance';
import { MongoId } from 'types/mongoose';

export default class BalanceRepository extends AbstractRepository<IBalance<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, BalanceModel);
	}

	// Assets
	findByAccountAndAsset(account: MongoId, asset: MongoId) {
		return <Promise<IBalanceAssetDocument>>this.findOne({ _account: account, _asset: asset });
	}

	async updateOrCreateByAccountAndAsset(account: MongoId, asset: MongoId, amount: string) {
		const dBalance = await this.findByAccountAndAsset(account, asset);
		if (!dBalance) return this.createByAccountAndAsset(account, asset, amount);
		dBalance.amount = amount;
		await dBalance.save();
		return dBalance;
	}

	createByAccountAndAsset(accountId: MongoId, assetId: MongoId, amount: string) {
		return <Promise<IBalanceAssetDocument>>super.create({
			amount,
			_account: accountId,
			_asset: assetId,
			type: BALANCE.TYPE.ASSET,
		});
	}

	// Tokens
	findByAccountAndContract(accountId: MongoId, contractId: MongoId): Promise<IBalanceTokenDocument> {
		return <Promise<IBalanceTokenDocument>>super.findOne({ _account: accountId, _contract: contractId });
	}

	async updateOrCreateByAccountAndContract(accountId: MongoId, contractId: MongoId, amount: string) {
		const dBalance = await this.findByAccountAndContract(accountId, contractId);
		if (!dBalance) return this.createByAccountAndContract(accountId, contractId, amount);
		dBalance.amount = amount;
		await dBalance.save();
		return dBalance;
	}

	createByAccountAndContract(accountId: MongoId, contractId: MongoId, amount: string) {
		return <Promise<IBalanceTokenDocument>>super.create({
			amount,
			_account: accountId,
			type: BALANCE.TYPE.TOKEN,
			_contract: contractId,
		});
	}

}
