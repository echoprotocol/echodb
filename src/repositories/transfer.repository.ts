import AbstractRepository from './abstract.repository';
import RavenHelper from 'helpers/raven.helper';
import TransferModel from '../models/transfer.model';
import * as BALANCE from '../constants/balance.constants';
import { ITransfer } from '../interfaces/ITransfer';

export default class TransferRepository extends AbstractRepository<ITransfer<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, TransferModel);
	}

}
