import AssetPrice from './asset.price.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetBitassetFeed {
	@Field() maintenance_collateral_ratio: number;
	@Field() maximum_short_squeeze_ratio: number;
	@Field(() => AssetPrice) settlement_price: AssetPrice;
	@Field(() => AssetPrice) core_exchange_rate: AssetPrice;
}
