import AccountRepository from '../../../repositories/account.repository';
import BlockRepository from '../../../repositories/block.repository';
import AbstractResolver, { handleError } from './abstract.resolver';
import Contract from '../types/contract.type';
import ContractService, { ERROR as CONTRACT_SERVICE_ERROR } from '../../../services/contract.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import * as TOKEN from '../../../constants/token.constants';
import {
	GetContractForm,
	GetContractsForm,
	NewContractSubscribeForm,
	ContractHistoryUpdatedSubscribeForm,
} from '../forms/contract.forms';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';
import { TDoc } from '../../../types/mongoose';
import { IContract } from '../../../interfaces/IContract';

const paginatedContracts = PaginatedResponse(Contract);

interface INewContractSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_CONTRACT>;
	args: NewContractSubscribeForm;
}

interface IContractHistoryUpdatedSubscriptionFilter {
	payload: Payload<REDIS.EVENT.NEW_OPERATION>;
	args: ContractHistoryUpdatedSubscribeForm;
}

@Resolver(Contract)
export default class ContractResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static blockRepository: BlockRepository;
	@inject static contractService: ContractService;

	constructor(
		private accountRepository: AccountRepository,
		private blockRepository: BlockRepository,
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

	@FieldResolver()
	calling_accounts(@Root('_calling_accounts') ids: Contract['_calling_accounts']) {
		return this.resolveArrayMongoField(ids, this.accountRepository);
	}

	@FieldResolver()
	block(@Root('_block') id: Contract['_block']) {
		return this.resolveMongoField(id, this.blockRepository);
	}

	@FieldResolver()
	token(@Root('type') type: Contract['type'], @Root() body: TDoc<IContract>) {
		return (TOKEN.TYPE_LIST.includes(type)) ? body : null;
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
		@Args() _: NewContractSubscribeForm,
	) {
		return dContract;
	}

	@Subscription(() => Contract, {
		topics: REDIS.EVENT.NEW_OPERATION,
		filter: ({
			payload: dOperation,
			args: { contracts },
		}: IContractHistoryUpdatedSubscriptionFilter) => {
			if (contracts && !dOperation._relation.contracts.some((relId) => contracts.includes(relId))) return false;
			return true;
		},
	})
	contractHistoryUpdated(
		@Root() dOperation: Payload<REDIS.EVENT.NEW_OPERATION>,
		@Args() args: ContractHistoryUpdatedSubscribeForm,
	) {
		const { contracts } = args;
		const contractId = contracts.find((id) => dOperation._relation.contracts.includes(id));
		return this.contractService.getContract(contractId);
	}

}
