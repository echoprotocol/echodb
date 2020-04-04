import { ObjectType, Field } from 'type-graphql';
import Account from './account.type';
import Contract from './contract.type';

@ObjectType()
export default class ERC20TokenType {
	@Field() id: string;
	@Field(() => Account) owner: Account;
	@Field() eth_addr: string;
	@Field(() => Contract) contract: Contract;
	@Field() name: string;
	@Field() symbol: string;
	@Field() decimals: number;
}
