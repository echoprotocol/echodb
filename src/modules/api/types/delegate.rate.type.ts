import { ObjectType, Field } from 'type-graphql';

@ObjectType()
class ratesMapClass {
  @Field() startIntervalDateString: string;
  @Field() rate: number;
}
@ObjectType()
export default class delegateRateObject {
  @Field() delegatePercent: number;
  @Field(() => [ratesMapClass]) ratesMap: ratesMapClass[];
}
