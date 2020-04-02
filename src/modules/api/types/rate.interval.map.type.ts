import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class RatesMapClass {
  @Field() startIntervalDateString: string;
  @Field() rate: number;
}