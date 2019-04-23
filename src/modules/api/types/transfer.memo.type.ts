import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Memo {
	@Field() from: string;
	@Field() to: string;
	@Field() nonce: string;
	@Field() message: string;
}
