import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class HistoryBlockObject {
	@Field(() => Number, { nullable: true }) blocksCount: number;
	@Field(() => Number, { nullable: true }) operationsCount: number;
}
