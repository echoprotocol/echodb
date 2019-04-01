import AbstractResolver, { handleError } from './abstract.resolver';
import AccountService from '../../../services/account.service';
import Contract from '../types/contract.type';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import { ContractForm, ContractsForm } from '../forms/contract.forms';
import { Resolver, Query, Args, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
const paginatedContracts = PaginatedResponse(Contract);

@Resolver(Contract)
export default class ContractResolver extends AbstractResolver {
	@inject static accountService: AccountService;
	@inject static contractService: ContractService;

	constructor(
		private accountService: AccountService,
		private contractService: ContractService,
	) {
		super();
	}

	@Query(() => Contract)
	@handleError({
		[CONTRACT_SERVICE_ERROR.CONTRACT_NOT_FOUND]: [404],
	})
	async getContract (@Args() { id }: ContractForm) {
		return await this.contractService.getContract(id);
	}

	@Query(() => paginatedContracts)
	getContracts(@Args() { count, offset, registrars, type }: ContractsForm) {
		return this.contractService.getContracts(count, offset, { registrars, type });
	}

	@FieldResolver()
	registrar(@Root('registrar') id: string) {
		return this.accountService.getAccount(id);
	}
}
