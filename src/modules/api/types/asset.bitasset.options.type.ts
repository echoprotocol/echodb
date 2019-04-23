import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetBitassetOptions {
	@Field() short_backing_asset: string;
	@Field() maximum_force_settlement_volume: number;
	@Field() force_settlement_offset_percent: number;
	@Field() force_settlement_delay_sec: number;
	@Field() feed_lifetime_sec: number;
	@Field() minimum_feeds: number;
}
