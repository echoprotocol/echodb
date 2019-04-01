import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AccountHistory {

	@Field()
	transaction: string;
}
