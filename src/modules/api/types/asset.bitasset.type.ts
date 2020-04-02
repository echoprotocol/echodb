import AssetBitassetOptions from './asset.bitasset.options.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetBitasset {
	@Field() id: string;
	@Field() current_feed_publication_time: string;
	@Field() force_settled_volume: number;
	@Field(() => [String]) feeds: unknown[];
	@Field(() => AssetBitassetOptions) options: AssetBitassetOptions;
}
