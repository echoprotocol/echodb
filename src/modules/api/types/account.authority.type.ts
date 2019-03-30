import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';

@ObjectType({
	description: 'Tuples are no supported by GQL, some fields are not shown',
})
export default class AccountAuthority {
	@Field()
	weight_threshold: number;

	// FIXME: tuples are not supported by gql
	// @Field(() => [[String, Number]])
	// account_auths: [string, number][];

	// FIXME: tuples are not supported by gql
	// @Field(() => [[String, Number]])
	// key_auths: [string, number][];

	// FIXME: tuples are not supported by gql
	// @Field(() => [[String, Number]])
	// address_auths: [string, number][];
}
