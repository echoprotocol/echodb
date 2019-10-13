import AbstractRepository from './abstract.repository';
import AccountModel from '../models/account.model';
import RavenHelper from '../helpers/raven.helper';
import { IAccount } from '../interfaces/IAccount';
import { AccountId } from '../types/echo';
import { removeDuplicates } from '../utils/common';
import { TDoc } from '../types/mongoose';

export default class AccountRepository extends AbstractRepository<IAccount> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, AccountModel);
	}

	findById(id: string) {
		return super.findOne({ id });
	}

	async findManyByIds(ids: AccountId[]) {
		const dAccountsMap = new Map<AccountId, TDoc<IAccount>>();
		await Promise.all(removeDuplicates(ids).map(async (id) => {
			const dAccount = await this.findById(id);
			dAccountsMap.set(id, dAccount);
		}));
		return ids.map((id) => dAccountsMap.get(id));
	}

	findByAddress(address: string) {
		return super.findOne({ addresses: { $elemMatch: { address }}});
	}
}
