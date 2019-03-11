import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import { ITransactionDocument } from '../interfaces/ITransaction';
import TransactionModel from '../models/transaction.model';

export default class TransactionRepository extends AbstractRepository<ITransactionDocument> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, TransactionModel);
	}
}
