import ProposalRepository from '../../../repositories/proposal.repository';
import AbstractOperation from './abstract.operation';
import RedisConnection from '../../../connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_UPDATE;
type UpdateProposal = {
	active_approvals_to_add?: string[];
	active_apprivals_to_remove?: string[];
	owner_approvals_to_remove?: string[];
	key_approvals_to_add?: string[];
	key_approvals_to_remove?: string[];
};

export default class ProposalUpdater extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.PROPOSAL_UPDATE;

	constructor(
        readonly redisConnection: RedisConnection,
        readonly proposalRepository: ProposalRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const toUpdate: UpdateProposal = {};
		if (body.active_approvals_to_add) toUpdate.active_approvals_to_add = body.active_approvals_to_add;
		if (body.active_apprivals_to_remove) toUpdate.active_apprivals_to_remove = body.active_apprivals_to_remove;
		if (body.owner_approvals_to_remove) toUpdate.owner_approvals_to_remove = body.owner_approvals_to_remove;
		if (body.key_approvals_to_add) toUpdate.key_approvals_to_add = body.key_approvals_to_add;
		if (body.key_approvals_to_remove) toUpdate.key_approvals_to_remove = body.key_approvals_to_remove;
		const dProposal = await this.proposalRepository.findOneAndUpdate(
			{ id: body.proposal },
			{ $set: toUpdate },
			{ new: true },
		);
		this.redisConnection.emit(REDIS.EVENT.PROPOSAL_UPDATED, dProposal);
		return this.validateRelation({
			from: [body.fee_paying_account],
			assets: [body.fee.asset_id],
		});
	}

}
