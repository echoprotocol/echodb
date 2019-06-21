import Account from './account.type';
import ContractId from './contract.id.type';
import Block from './block.type';
import Token from './token.type';
import * as CONTRACT from '../../../constants/contract.constants';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc } from '../../../types/mongoose';
import { ObjectType, Field } from 'type-graphql';
import { IBlock } from '../../../interfaces/IBlock';

@ObjectType()
export default class Contract {
	@Field(() => ContractId)
	id: string;

	_registrar: TDoc<IAccount>;
	@Field(() => Account)
	registrar: Account;

	@Field()
	eth_accuracy: boolean;

	@Field({ nullable: true })
	supported_asset_id: string;

	@Field()
	type: CONTRACT.TYPE;

	@Field(() => Token, { nullable: true })
	token: Token;

	_block: TDoc<IBlock>;
	@Field(() => Block)
	block: Block;

	_calling_accounts: TDoc<IAccount>[];
	@Field(() => [Account], { nullable: true })
	calling_accounts: Account[];
}
