import AssetPrice from './asset.price.type';
import AssetBitassetOptions from './asset.bitasset.options.type';
import AssetBitassetFeed from './asset.bitasset.feed.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetBitasset {
	@Field() id: string;
	@Field() current_feed_publication_time: string;
	@Field() force_settled_volume: number;
	@Field() settlement_fund: number;
	@Field(() => [String]) feeds: unknown[];
	@Field(() => AssetBitassetOptions) options: AssetBitassetOptions;
	@Field(() => AssetBitassetFeed) current_feed: AssetBitassetFeed;
	@Field(() => AssetPrice) settlement_price: AssetPrice;
}
