
export interface IProposal {
	fee_paying_account: string,
	proposed_ops: unknown[],
	expiration_time: string,
	review_period_seconds: number,
}