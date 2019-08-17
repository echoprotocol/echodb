import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AccountOptions {

	@Field()
	voting_account: string;

	@Field()
	delegating_account: string;

	@Field()
	num_committee: number;

	@Field(() => [String])
	votes: string[];

	@Field(() => [String])
	extensions: string[];
}
