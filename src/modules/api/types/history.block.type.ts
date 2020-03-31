import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class historyBlockObject {
  @Field() blocksCount: number;
  @Field() operationsCount: number;
}
