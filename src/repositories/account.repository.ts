import AbstractRepository from './abstract.repository';
import AccountModel from '../models/account.model';
import RavenHelper from 'helpers/raven.helper';
import { IAccount } from '../interfaces/IAccount';

export default class AccountRepository extends AbstractRepository<IAccount> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, AccountModel);
	}

	findById(id: string) {
		return super.findOne({ id });
	}

}
