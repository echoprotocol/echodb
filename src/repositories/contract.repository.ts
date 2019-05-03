import AbstractRepository from './abstract.repository';
import ContractModel from '../models/contract.model';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import * as REDIS from '../constants/redis.constants';
import { IContract } from '../interfaces/IContract';

export default class ContractRepository extends AbstractRepository<IContract> {
	constructor(
		ravenHelper: RavenHelper,
		private redisConnection: RedisConnection,
	) {
		super(ravenHelper, ContractModel);
	}

	findById(id: string) {
		return super.findOne({ id });
	}

	async createAndEmit(contract: IContract) {
		const dContract = await super.create(contract);
		this.redisConnection.emit(REDIS.EVENT.NEW_CONTRACT, dContract);
		return dContract;
	}

}
