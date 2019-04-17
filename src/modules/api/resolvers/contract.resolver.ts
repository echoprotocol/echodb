import AccountRepository from '../../../repositories/account.repository';
import AbstractResolver, { handleError } from './abstract.resolver';
import Contract from '../types/contract.type';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as REDIS from '../../../constants/redis.constants';
import * as TOKEN from '../../../constants/token.constants';
import { ContractForm, ContractsForm, NewContractSubscribe } from '../forms/contract.forms';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';
import { MongoId } from '../../../types/mongoose';
import { IContractDocument } from 'interfaces/IContract';

const paginatedContracts = PaginatedResponse(Contract);

interface INewContractSubscriptionFilterArgs {
	payload: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.NEW_CONTRACT];
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

	@FieldResolver()
	token(@Root('type') type: Contract['type'], @Root() body: IContractDocument) {
		return (TOKEN.TYPE_LIST.includes(type)) ? body : null;
	}

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
		@Root() dContract: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.NEW_CONTRACT],
		// variable needed to be declared to appear in graphQl schema defenition, it's used in the subscription filter

		@Args() _: NewContractSubscribe,
	) {
		return dContract;
	}

	// FIXME: do it in a better way
	@FieldResolver()
	registrar(@Root('_registrar') registrar: MongoId) {
		if (isMongoObjectId(registrar)) return this.accountRepository.findByMongoId(registrar);
		if (this.accountRepository.isChild(registrar)) return registrar;
	}

}
