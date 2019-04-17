import AccountRepository from '../../../repositories/account.repository';
import AbstractResolver, { validateArgs, handleError } from './abstract.resolver';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import Token from '../types/token.type';
import PaginatedResponse from '../types/paginated.response.type';
import * as HTTP from '../../../constants/http.constants';
import { Resolver, Query, Args, FieldResolver, Root } from 'type-graphql';
import { GetTokensForm } from '../forms/token.forms';
import { inject } from '../../../utils/graphql';
import { IContract } from '../../../interfaces/IContract';
import { TDoc } from '../../../types/mongoose';

const paginatedTokens = PaginatedResponse(Token);

@Resolver(Token)
export default class ContractResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static contractService: ContractService;

	constructor(
		private accountRepository: AccountRepository,
		private contractService: ContractService,
	) {
		super();
	}

	// Query
	@Query(() => paginatedTokens)
	@validateArgs(GetTokensForm)
	@handleError({
		[CONTRACT_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	getTokens (@Args() form: GetTokensForm) {
		return this.contractService.getTokens(form.count, form.offset, form);
	}

	// FieldResolver
	@FieldResolver()
	type(@Root() dContract: TDoc<IContract>) {
		return dContract.type;
	}

	@FieldResolver()
	symbol(@Root() dContract: TDoc<IContract>) {
		return dContract.token_info.symbol;
	}

	@FieldResolver()
	name(@Root() dContract: TDoc<IContract>) {
		return dContract.token_info.name;
	}


	decimals(@Root() dContract: TDoc<IContract>) {
		return dContract.token_info.decimals;
	}

	@FieldResolver()
	total_supply(@Root() dContract: TDoc<IContract>) {
		return dContract.token_info.total_supply;
	}
	@FieldResolver()
	registrar(@Root() dContract: TDoc<IContract>) {
		return this.resolveMongoField(dContract._registrar, this.accountRepository);
	}

	@FieldResolver()
	contract(@Root() dContract: TDoc<IContract>) {
		return dContract;
	}

}
