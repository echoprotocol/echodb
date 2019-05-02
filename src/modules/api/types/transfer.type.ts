import Account from '../types/account.type';
import Contract from '../types/contract.type';
import Asset from '../types/asset.type';
import Memo from './transfer.memo.type';
import StringifiedNumber from './string.number.type';
import * as BALANCE from '../../../constants/balance.constants';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';

@ObjectType()
export default class Transfer {
	_from: MongoId;
	_to: MongoId;
	_asset: MongoId;
	_contract: MongoId;
	@Field(() => Account) from: string;
	@Field(() => Account) to: string;
	@Field(() => StringifiedNumber) amount: string;
	@Field(() => Asset) asset: Asset;
	@Field(() => Contract) contract: string;
	@Field(() => BALANCE.TYPE) type: BALANCE.TYPE;
	@Field({ nullable: true }) memo: Memo;
}
