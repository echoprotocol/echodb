import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AccountCommitteeOptions {
	@Field(() => String, { nullable: true }) status: string;
	@Field(() => String, { nullable: true }) eth_address: string;
	@Field(() => String, { nullable: true }) btc_public_key: string;
	@Field(() => String, { nullable: true }) committee_member_id: string;
	@Field(() => String, { nullable: true }) proposal_operation: string;
	@Field(() => Number, { nullable: true }) approves_count: number;
	@Field(() => String, { nullable: true }) last_status_change_time: string;
	@Field(() => String, { nullable: true }) last_executed_operation: string;
	@Field(() => String, { nullable: true }) proposal_id: string;
}
