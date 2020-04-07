import { ObjectType, Field } from 'type-graphql';
import RateIntervalMap from './rate.interval.map.type';

@ObjectType()
export default class HistoryOperationCountObject {
	@Field(() => [RateIntervalMap]) ratesMap: RateIntervalMap[];
	@Field(() => Number, { description: 'Total count of operation in passed period' }) total: number;
}
