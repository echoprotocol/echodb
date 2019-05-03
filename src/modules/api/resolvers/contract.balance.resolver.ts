import AbstractResolver, { validateArgs, validateSubscriptionArgs } from './abstract.resolver';
import ContractBalance from '../types/contract.balance.type';
import ContractRepository from '../../../repositories/contract.repository';
import BalanceService from '../../../services/balance.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as REDIS from '../../../constants/redis.constants';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';
import { ContractBalanceSubscribeForm, GetContractBalancesForm } from '../forms/contract.balance.forms';

const paginatedBalances = PaginatedResponse(ContractBalance);

interface IContractBalanceSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_CONTRACT_BALANCE> | Payload<REDIS.EVENT.CONTRACT_BALANCE_UPDATED>;
	args: ContractBalanceSubscribeForm;
}

@Resolver(ContractBalance)
export default class ContractBalanceResolver extends AbstractResolver {
	@inject static contractRepository: ContractRepository;
	@inject static balanceService: BalanceService;

	constructor(
		private contractRepository: ContractRepository,
		private balanceService: BalanceService,
	) {
		super();
	}

	// Query
	@Query(() => paginatedBalances)
	@validateArgs(GetContractBalancesForm)
	getContractBalances(@Args() { count, offset, contracts }: GetContractBalancesForm) {
		return this.balanceService.getContractBalances(count, offset, contracts);
	}

	// FieldResolver
	@FieldResolver()
	contract(@Root('_contract') id: ContractBalance['_contract']) {
		return this.resolveMongoField(id, this.contractRepository);
	}

	// Subscription
	@Subscription(() => ContractBalance, {
		topics: validateSubscriptionArgs(REDIS.EVENT.NEW_CONTRACT_BALANCE, ContractBalanceSubscribeForm),
		filter: ContractBalanceResolver.contractBalanceFilter,
	})
	newContractBalance(
		@Root() dBalance: Payload<REDIS.EVENT.NEW_CONTRACT_BALANCE>,
		@Args() _: ContractBalanceSubscribeForm,
	) {
		return dBalance;
	}

	@Subscription(() => ContractBalance, {
		topics: validateSubscriptionArgs(REDIS.EVENT.CONTRACT_BALANCE_UPDATED, ContractBalanceSubscribeForm),
		filter: ContractBalanceResolver.contractBalanceFilter,
	})
	contractBalanceUpdated(
		@Root() dBalance: Payload<REDIS.EVENT.CONTRACT_BALANCE_UPDATED>,
		@Args() _: ContractBalanceSubscribeForm,
	) {
		return dBalance;
	}

	static async contractBalanceFilter(
		{ payload: dBalance, args: { owners: contracts } }: IContractBalanceSubscriptionFilterArgs,
	) {
		if (contracts && contracts.length && !contracts.includes(dBalance._owner.id)) return false;
		return true;
	}

}
