import { ObjectType, Field } from 'type-graphql';

@ObjectType()
class Key {
	@Field() key: string;
	@Field() value: number;
}
@ObjectType()
export default class AccountAuthority {
	@Field()
	weight_threshold: number;

	@Field(() => [Key])
	account_auths: Key[];

	@Field(() => [Key])
	key_auths: Key[];

	@Field(() => [Key])
	address_auths?: Key[];
}
