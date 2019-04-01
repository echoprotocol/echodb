import Contract from './contract.type';
import Account from './account.type';
import * as TOKEN from '../../../constants/token.constants';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

registerEnumType(TOKEN.TYPE, {
	name: 'TokenTypeEnum',
	description: 'Type of a token',
});

@ObjectType()
export default class TokenType {
	@Field() type: string;
	@Field() symbol: string;
	@Field() name: string;
	@Field() total_supply: string;
	@Field() registrar: Account;

	@Field(() => Contract)
	contract: Contract;
}
