import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AccountAuthority {
	@Field()
	weight_threshold: number;

	@Field(() => [[String, Number]])
	account_auths: [string, number][];

	@Field(() => [[String, Number]])
	key_auths: [string, number][];

	@Field(() => [[String, Number]])
	address_auths: [string, number][];
}
