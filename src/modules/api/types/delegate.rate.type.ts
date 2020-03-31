import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class delegateRateObject {
  @Field() delegatePercent: number;
  @Field() ratesMap?: Map<string, number>;
}
