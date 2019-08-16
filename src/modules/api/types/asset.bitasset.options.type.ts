import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetBitassetOptions {
	@Field() short_backing_asset: string;
	@Field() feed_lifetime_sec: number;
	@Field() minimum_feeds: number;
}
