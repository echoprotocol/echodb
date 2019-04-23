import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetPriceAmount {
	@Field() amount: string;
	@Field() asset_id: string;
}
