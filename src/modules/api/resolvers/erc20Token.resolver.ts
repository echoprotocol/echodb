import { Resolver, FieldResolver, Root, Args, Query } from 'type-graphql';
import ERC20TokenType from '../types/erc20Token.type';
import AbstractResolver, { validateArgs } from './abstract.resolver';
import { inject } from '../../../utils/graphql';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import { MongoId } from '../../../types/mongoose';
import ERC20TokenService from '../../../services/erc20-token.service';
import { GetERC20TokenForm } from '../forms/token.forms';

@Resolver(ERC20TokenType) export default class ERC20TokenResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static contractRepository: ContractRepository;
	@inject static erc20TokenService: ERC20TokenService;

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private erc20TokenService: ERC20TokenService,
	) {
		super();
	}

	@Query(() => ERC20TokenType)
	@validateArgs(GetERC20TokenForm)
	getTokenByETHAddress(
		@Args() {
			ethAddress,
		}: GetERC20TokenForm,
	) {
		return this.erc20TokenService.getTokenByETHAddress(ethAddress);
	}

	@FieldResolver() owner(@Root('owner') id: MongoId) { return this.resolveMongoField(id, this.accountRepository); }

	@FieldResolver()
	contract(@Root('contract') id: MongoId) { return this.resolveMongoField(id, this.contractRepository); }
}
