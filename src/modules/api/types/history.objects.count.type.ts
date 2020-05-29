import { ObjectType, Field } from 'type-graphql';
import RateIntervalMap from './rate.interval.map.type';

@ObjectType()
export default class HistoryObjectsCountObject {
	@Field(() => [RateIntervalMap]) ratesMap: RateIntervalMap[];
	@Field(() => Number, { description: 'Total count of object in passed period' }) total: number;
}
