import Asset from './asset.type';
import Account from './account.type';
import Contract from './contract.type';
import * as BALANCE from '../../../constants/balance.constants';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';

@ObjectType()
export default class Balance {
	_account: MongoId;
	_contract: MongoId;
	_asset: MongoId;
	@Field() account: Account;
	@Field(() => BALANCE.TYPE) type: BALANCE.TYPE;
	@Field() amount: number;
	@Field({ nullable: true }) asset: Asset;
	@Field({ nullable: true }) contract: Contract;
}
