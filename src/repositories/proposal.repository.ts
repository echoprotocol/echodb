import AbstractRepository from './abstract.repository';
import ProposalModel from '../models/proposal.model';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import { IProposal } from '../interfaces/IProposal';
import * as REDIS from '../constants/redis.constants';


export default class ProposalRepository extends AbstractRepository<IProposal> {

	constructor(
		ravenHelper: RavenHelper,
		private redisConnection: RedisConnection,
	) {
		super(ravenHelper, ProposalModel);
	}

	async createAndEmit(proposal: IProposal) {
		const dProposal = await super.create(proposal);
		this.redisConnection.emit(REDIS.EVENT.NEW_PROPOSAL, dProposal);
		return dProposal;
	}

}
