import Account from './account.type';
import AssetOptions from './asset.options.type';
import AssetId from './asset.id.type';
import AssetBitasset from './asset.bitasset.type';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';

@ObjectType()
export default class Asset {
	_id: MongoId;
	_account: MongoId;
	@Field(() => AssetId) id: string;
	@Field(() => Account) account: Account;
	@Field() symbol: string;
	@Field() precision: number;
	@Field(() => AssetOptions) options: AssetOptions;
	@Field(() => AssetBitasset, { nullable: true }) bitasset: AssetBitasset;
}
