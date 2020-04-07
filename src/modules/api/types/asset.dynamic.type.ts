import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetDynamic {
	@Field() id: string;
	@Field() current_supply: string;
	@Field() accumulated_fees: string;
	@Field() fee_pool: string;
}
