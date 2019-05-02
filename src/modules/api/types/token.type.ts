import Contract from './contract.type';
import Account from './account.type';
import StringifiedNumber from './string.number.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Token {
	@Field() type: string;
	@Field() symbol: string;
	@Field() name: string;
	@Field(() => StringifiedNumber) total_supply: string;
	@Field() decimals: string;
	@Field() registrar: Account;

	@Field(() => Contract)
	contract: Contract;
}
