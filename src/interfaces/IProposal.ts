import { ProposalId } from '../types/echo';

export interface IProposal {
	id: ProposalId,
	fee_paying_account: string,
	proposed_ops: unknown[],
	expiration_time: string,
	review_period_seconds: number,
}