import AbstractRepository from './abstract.repository';
import BalanceModel from '../models/balance.model';
import RavenHelper from 'helpers/raven.helper';
import * as BALANCE from '../constants/balance.constants';
import { IBalance, IBalanceToken, IBalanceTokenDocument } from 'interfaces/IBalance';
import { MongoId } from 'types/mongoose';

export default class BalanceRepository extends AbstractRepository<IBalance<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, BalanceModel);
	}

	async findTokensByAccountAndContract(account: MongoId, contract: MongoId): Promise<IBalanceTokenDocument> {
		const dBalance = await super.findOne({ _account: account, _contract: contract });
		if (dBalance) return <IBalanceTokenDocument>dBalance;
		const balance: IBalanceToken = {
			_account: account,
			type: BALANCE.TYPE.TOKEN,
			amount: '0',
			_contract: contract,
		};
		return <IBalanceTokenDocument>await super.create(balance);
	}

}
