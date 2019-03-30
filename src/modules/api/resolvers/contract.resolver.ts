import 'reflect-metadata';
import AccountService from '../../../services/account.service';
import Contract from '../types/contract.type';
import ContractService from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as API from '../../../constants/api.constants';
import * as CONTRACT from '../../../constants/contract.constants';
import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';

const paginatedContracts = PaginatedResponse(Contract);

@Resolver(Contract)
export default class ContractResolver {
	@inject static contractService: ContractService;
	@inject static accountService: AccountService;

	constructor(
		private contractService: ContractService,
		private accountService: AccountService,
	) {}

	@Query((_) => Contract)
	getContract(
		@Arg('id', { nullable: false }) id: string,
	) {
		return this.contractService.getContract(id);
	}

	@Query((_) => paginatedContracts)
	getContracts(
		@Arg('count', { defaultValue: API.PAGINATION.DEFAULT_COUNT }) count: number,
		@Arg('offset', { defaultValue: 0 }) offset: number,
		@Arg('registrars', () => [String], { nullable: true }) registrars?: string[],
		@Arg('type', () => CONTRACT.TYPE, { nullable: true }) type?: CONTRACT.TYPE,
	) {
		return this.contractService.getContracts(count, offset, { registrars, type });
	}

	@FieldResolver()
	registrar(@Root('registrar') id: string) {
		return this.accountService.getAccount(id);
	}
}
