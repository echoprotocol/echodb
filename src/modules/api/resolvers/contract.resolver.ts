import AccountRepository from '../../../repositories/account.repository';
import AbstractResolver, { handleError } from './abstract.resolver';
import Contract from '../types/contract.type';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import { GetContractForm, GetContractsForm, NewContractSubscribe } from '../forms/contract.forms';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';

const paginatedContracts = PaginatedResponse(Contract);

interface INewContractSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_CONTRACT>;
	args: NewContractSubscribe;
}

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

	// Query
	@Query(() => Contract)
	@handleError({
		[CONTRACT_SERVICE_ERROR.CONTRACT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	getContract (@Args() { id }: GetContractForm) {
		return this.contractService.getContract(id);
	}

	@Query(() => paginatedContracts)
	getContracts(@Args() { count, offset, registrars, type }: GetContractsForm) {
		return this.contractService.getContracts(count, offset, { registrars, type });
	}

	// FieldResolver
	@FieldResolver()
	registrar(@Root('_registrar') id: Contract['_registrar']) {
		return this.resolveMongoField(id, this.accountRepository);
	}

	// Subscription
	@Subscription(() => Contract, {
		topics: REDIS.EVENT.NEW_CONTRACT,
		filter: ({
			payload: dContract,
			args: { contractType },
		}: INewContractSubscriptionFilterArgs) => {
			return !contractType || dContract.type === contractType;
		},
	})
	newContract(
		@Root() dContract: Payload<REDIS.EVENT.NEW_CONTRACT>,
		// variable needed to be declared to appear in graphQl schema defenition, it's used in the subscription filter

		@Args() _: NewContractSubscribe,
	) {
		return dContract;
	}

}
