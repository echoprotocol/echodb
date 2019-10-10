import { ProposalId } from '../types/echo';

export interface IProposal {
	id: ProposalId;
	fee_paying_account: string;
	proposed_ops: unknown[];
	expiration_time: string;
	review_period_seconds: number;
	active_approvals_to_add: string[];
	active_apprivals_to_remove: string[];
	owner_approvals_to_remove: string[];
	key_approvals_to_add: string[];
	key_approvals_to_remove: string[];
}