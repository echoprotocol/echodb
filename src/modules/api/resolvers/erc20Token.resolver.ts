import { Resolver, FieldResolver, Root } from 'type-graphql';
import ERC20TokenType from '../types/erc20Token.type';
import AbstractResolver from './abstract.resolver';
import { inject } from '../../../utils/graphql';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import { MongoId } from '../../../types/mongoose';

@Resolver(ERC20TokenType) export default class ERC20TokenResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static contractRepository: ContractRepository;

	constructor(private accountRepository: AccountRepository, private contractRepository: ContractRepository) {
		super();
	}

	@FieldResolver() owner(@Root('owner') id: MongoId) { return this.resolveMongoField(id, this.accountRepository); }

	@FieldResolver()
	contract(@Root('contract') id: MongoId) { return this.resolveMongoField(id, this.contractRepository); }
}
