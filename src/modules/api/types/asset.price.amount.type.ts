import StringifiedNumber from './string.number.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AssetPriceAmount {
	@Field(() => StringifiedNumber) amount: string;
	@Field() asset_id: string;
}
