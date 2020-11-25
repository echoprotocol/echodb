import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import { ITransaction } from '../interfaces/ITransaction';
import TransactionModel from '../models/transaction.model';
import { MongoId } from 'types/mongoose';

export default class TransactionRepository extends AbstractRepository<ITransaction> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, TransactionModel);
	}

	findByBlockMongoId(id: MongoId) {
		return super.find({ _block: id });
	}

	findByTrxDigest(trxDigest: string) {
		return super.findOne({
			trx_hex: { $regex: `^${trxDigest}` },
		});
	}
}
