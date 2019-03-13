import AbstractRepository from './abstract.repository';
import RavenHelper from 'helpers/raven.helper';
import AccountModel from '../models/account.model';
import { IAccount } from '../interfaces/IAccount';
import { MongoId } from 'types/mongoose';

export default class AccountRepository extends AbstractRepository<IAccount> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, AccountModel);
	}

	findById(id: string) {
		return super.findOne({ id });
	}

	findByMongoId(id: MongoId) {
		return super.findById(id);
	}

}
