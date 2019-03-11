import AbstractRepository from './abstract.repository';
import RavenHelper from 'helpers/raven.helper';
import AccountModel from '../models/account.model';
import { IAccountDocument } from '../interfaces/IAccount';

export default class AccountRepository extends AbstractRepository<IAccountDocument> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, AccountModel);
	}

}
