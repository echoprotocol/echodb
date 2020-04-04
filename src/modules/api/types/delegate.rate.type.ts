import { ObjectType, Field } from 'type-graphql';
import RateIntervalMap from './rate.interval.map.type';

@ObjectType()
export default class DelegateRateObject {
	@Field() delegatePercent: number;
	@Field(() => [RateIntervalMap]) ratesMap: RateIntervalMap[];
}
