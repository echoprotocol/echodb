import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import TransferModel from '../models/transfer.model';
import * as BALANCE from '../constants/balance.constants';
import * as REDIS from '../constants/redis.constants';
import { ITransfer } from '../interfaces/ITransfer';

export default class TransferRepository extends AbstractRepository<ITransfer<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
		private redisConnection: RedisConnection,
	) {
		super(ravenHelper, TransferModel);
	}

	async createAndEmit(transfer: ITransfer) {
		const dTransfer = await super.create(transfer);
		this.redisConnection.emit(REDIS.EVENT.NEW_TRANSFER, dTransfer);
		return dTransfer;
	}

}
