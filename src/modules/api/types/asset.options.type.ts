import AssetPrice from './asset.price.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetOptions {
	@Field() flags: number;
	@Field() issuer_permissions: number;
	@Field() max_supply: string;
	@Field() description: string;
	@Field(() => [String]) whitelist_authorities: unknown[];
	@Field(() => [String]) blacklist_authorities: unknown[];
	@Field(() => AssetPrice) core_exchange_rate: AssetPrice;
}
