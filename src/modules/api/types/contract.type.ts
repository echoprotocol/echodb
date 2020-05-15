import Account from './account.type';
import ContractId from './contract.id.type';
import Block from './block.type';
import Token from './token.type';
import * as CONTRACT from '../../../constants/contract.constants';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc, MongoId } from '../../../types/mongoose';
import { ObjectType, Field } from 'type-graphql';
import { IBlock } from '../../../interfaces/IBlock';
import { IContract } from 'interfaces/IContract';
import ERC20TokenType from './erc20Token.type';

@ObjectType()
export class ContractCallers {
	@Field(() => [Contract])
	contracts: TDoc<IContract>[];

	@Field(() => [Account])
	accounts: TDoc<IAccount>[];
}

@ObjectType()
export default class Contract {
	_id: MongoId<IContract>;

	@Field(() => ContractId)
	id: string;

	_registrar: TDoc<IAccount>;
	@Field(() => Account, { nullable: true })
	registrar: Account;

	@Field({ nullable: true })
	eth_accuracy: boolean;

	@Field({ nullable: true })
	supported_asset_id: string;

	@Field({ nullable: true })
	type: CONTRACT.TYPE;

	@Field(() => Token, { nullable: true })
	token: Token;

	_block: TDoc<IBlock>;
	@Field(() => Block, { nullable: true })
	block: Block;

	@Field(() => ContractCallers, { nullable: true })
	callers: ContractCallers;

	@Field(() => ERC20TokenType, { nullable: true }) sidechainERC20Token: ERC20TokenType;

}
