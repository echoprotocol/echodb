import AbstractOperation from './abstract.operation';
import ProposalRepository from 'repositories/proposal.repository';
import RedisConnection from 'connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_CREATE;

export default class ProposalCreateOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.PROPOSAL_CREATE;
    
    constructor(
        readonly redisConnection: RedisConnection,
        readonly proposalRepository: ProposalRepository,
	) {
		super();
    }
    
    async parse(body: ECHO.OPERATION_PROPS<OP_ID>, result: ECHO.OPERATION_RESULT<OP_ID>) {
        this.proposalRepository.createAndEmit({
            id: result,
            fee_paying_account: body.fee_paying_account,
            proposed_ops: body.proposed_ops,
            expiration_time: body.expiration_time,
            review_period_seconds: body.review_period_seconds,
            active_approvals_to_add: [],
            active_apprivals_to_remove: [],
            owner_approvals_to_remove: [],
            key_approvals_to_add: [],
            key_approvals_to_remove: [],
        });
        return this.validateRelation({
            from: [body.fee_paying_account],
            assets: [body.fee.asset_id],
        });
    }
}