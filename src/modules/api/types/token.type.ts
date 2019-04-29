import Contract from './contract.type';
import Account from './account.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Token {
	@Field() type: string;
	@Field() symbol: string;
	@Field() name: string;
	@Field() total_supply: string;
	@Field() decimals: string;
	@Field() registrar: Account;

	@Field(() => Contract)
	contract: Contract;
}
