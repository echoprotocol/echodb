import AbstractResolver, { handleError } from './abstract.resolver';
import AccountService from '../../../services/account.service';
import Contract from '../types/contract.type';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as API from '../../../constants/api.constants';
import * as CONTRACT from '../../../constants/contract.constants';
import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql';
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
	async getContract (
		@Arg('id', { nullable: false }) id: string,
	) {
		return await this.contractService.getContract(id);
	}

	@Query(() => paginatedContracts)
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
