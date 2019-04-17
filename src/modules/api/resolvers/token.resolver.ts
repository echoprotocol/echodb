import Token from '../types/token.type';
import { TokensForm } from '../forms/token.forms';

import AccountRepository from '../../../repositories/account.repository';
import AbstractResolver from './abstract.resolver';
import ContractService from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import { Resolver, Query, Args, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { IContractDocument } from '../../../interfaces/IContract';

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

	@Query(() => paginatedTokens)
	getTokens (@Args() form: TokensForm) {
		return this.contractService.getTokens(form.count, form.offset, form);
	}

	@FieldResolver()
	type(@Root() dContract: IContractDocument) {
		return dContract.type;
	}

	@FieldResolver()
	symbol(@Root() dContract: IContractDocument) {
		return dContract.token_info.symbol;
	}

	@FieldResolver()
	name(@Root() dContract: IContractDocument) {
		return dContract.token_info.name;
	}

	@FieldResolver()
	decimals(@Root() dContract: IContractDocument) {
		return dContract.token_info.decimals;
	}

	@FieldResolver()
	total_supply(@Root() dContract: IContractDocument) {
		return dContract.token_info.total_supply;
	}
	@FieldResolver()
	registrar(@Root() dContract: IContractDocument) {
		if (this.accountRepository.isChild(dContract._registrar)) return dContract._registrar;
		return this.accountRepository.findByMongoId(dContract._registrar);
	}

	@FieldResolver()
	contract(@Root() dContract: IContractDocument) {
		return dContract;
	}

}
