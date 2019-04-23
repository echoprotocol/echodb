import AssetPriceAmount from './asset.price.amount.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetPrice {
	@Field(() => AssetPriceAmount) base: AssetPriceAmount;
	@Field(() => AssetPriceAmount) quote: AssetPriceAmount;
}
