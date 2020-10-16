import { ObjectType, Field } from 'type-graphql';
import RateIntervalMap from './rate.interval.map.type';

@ObjectType()
export class DecentralizationRateObject {
	@Field(() => [RateIntervalMap]) ratesMap: RateIntervalMap[];
}

@ObjectType()
export class CurrentDecentralizationPercentObject {
	@Field() decentralizationPercent: number;
}
