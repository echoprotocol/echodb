import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Fee {
	@Field() amount: number;
	@Field() asset_id: string;
}
