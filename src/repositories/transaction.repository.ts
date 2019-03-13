import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import { ITransaction } from '../interfaces/ITransaction';
import TransactionModel from '../models/transaction.model';

export default class TransactionRepository extends AbstractRepository<ITransaction> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, TransactionModel);
	}
}
