import { ObjectType, Field } from 'type-graphql';
import RateIntervalMap from './rate.interval.map.type'

@ObjectType()
export default class DecentralizationRateObject {
  @Field() decentralizationRatePercent: number;
  @Field(() => [RateIntervalMap]) ratesMap: RateIntervalMap[];
}
