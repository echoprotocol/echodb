import AbstractRepository from './abstract.repository';
import UserModel from '../models/user.model';
import { IUserDocument } from '../interfaces/IUserDocument';
import RavenHelper from '../helpers/raven.helper';

export default class UserRepository extends AbstractRepository<IUserDocument> {

	constructor(ravenHelper: RavenHelper) {
		super(ravenHelper, UserModel);
	}

	findByName(name: string) {
		return super.findOne({ name });
	}

	findByKey(key: string) {
		return super.findOne({ key });
	}

}
