import { ObjectType, Field } from 'type-graphql';
import RateIntervalMap from './rate.interval.map.type';

@ObjectType()
export class DelegateRateObject {
	@Field(() => [RateIntervalMap]) ratesMap: RateIntervalMap[];
}

@ObjectType()
export class DelegatePercentObject {
	@Field() delegatePercent: number;
}
