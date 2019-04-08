import AccountRepository from '../../../repositories/account.repository';
import AbstractResolver, { handleError } from './abstract.resolver';
import Contract from '../types/contract.type';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import { ContractForm, ContractsForm } from '../forms/contract.forms';
import { Resolver, Query, Args, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';

const paginatedContracts = PaginatedResponse(Contract);

@Resolver(Contract)
export default class ContractResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static contractService: ContractService;

	constructor(
		private accountRepository: AccountRepository,
		private contractService: ContractService,
	) {
		super();
	}

	@Query(() => Contract)
	@handleError({
		[CONTRACT_SERVICE_ERROR.CONTRACT_NOT_FOUND]: [404],
	})
	getContract (@Args() { id }: ContractForm) {
		return this.contractService.getContract(id);
	}

	@Query(() => paginatedContracts)
	getContracts(@Args() { count, offset, registrars, type }: ContractsForm) {
		return this.contractService.getContracts(count, offset, { registrars, type });
	}

	// FIXME: do it in a better way
	@FieldResolver()
	registrar(@Root('_registrar') contract: any) {
		if (isMongoObjectId(contract)) return this.accountRepository.findByMongoId(contract);
		if (this.accountRepository.isChild(contract)) return contract;
	}

}
