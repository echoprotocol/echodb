import Account from './account.type';
import Contract from './contract.type';
import * as BALANCE from '../../../constants/balance.constants';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';

registerEnumType(BALANCE.TYPE, {
	name: 'BalanceTypeEnum',
	description: 'Type of a balance',
});

@ObjectType()
export default class Balance {
	_account: MongoId;
	_contract: MongoId;
	@Field() account: Account;
	@Field(() => BALANCE.TYPE) type: BALANCE.TYPE;
	@Field() amount: number;
	@Field({ nullable: true }) asset: string;
	@Field({ nullable: true }) contract: Contract;
}
