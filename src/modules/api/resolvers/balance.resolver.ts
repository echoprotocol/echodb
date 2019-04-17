import AbstractResolver, { handleError, validateArgs } from './abstract.resolver';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import Balance from '../types/balance.type';
import BalanceService, { ERROR as BALANCE_SERVICE_ERROR } from '../../../services/balance.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as REDIS from '../../../constants/redis.constants';
import { BalanceInForm, BalancesForm, BalanceSubscribe } from '../forms/balance.forms';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';

const paginatedBalances = PaginatedResponse(Balance);

interface IBalanceSubscriptionFilterArgs {
	payload: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.NEW_BALANCE] | REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.BALANCE_UPDATED];
	args: BalanceSubscribe;
}

@Resolver(Balance)
export default class BalanceResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static contractRepository: ContractRepository;
	@inject static balanceService: BalanceService;

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private balanceService: BalanceService,
	) {
		super();
	}

	@Query(() => paginatedBalances)
	@validateArgs(BalancesForm)
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [404, 'account not found'],
	})
	getBalances(@Args() { count, offset, accounts, type }: BalancesForm) {
		return this.balanceService.getBalance(count, offset, accounts, type);
	}

	@Query(() => Balance)
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [404],
		[BALANCE_SERVICE_ERROR.CONTRACT_NOT_FOUND]: [404],
	})
	getBalanceIn(@Args() { account, contract }: BalanceInForm) {
		return this.balanceService.getBalanceIn(account, contract);
	}

	// FIXME: do it in a better way
	@FieldResolver()
	account(@Root('_account') account: any) {
		if (isMongoObjectId(account)) return this.accountRepository.findByMongoId(account);
		return account;
	}

	// FIXME: do it in a better way
	@FieldResolver()
	contract(@Root('_contract') contract: any) {
		if (isMongoObjectId(contract)) return this.contractRepository.findByMongoId(contract);
		return contract;
	}

	@Subscription(() => Balance, {
		topics: REDIS.EVENT.NEW_BALANCE,
		filter: BalanceResolver.balanceChangeFilter,
		description: 'Filters by accounts and contract expected in 0.2.0',
	})
	newBalance(
		@Root() dBalance: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.NEW_BALANCE],
		@Args() _: BalanceSubscribe,
	) {
		return dBalance;
	}

	@Subscription(() => Balance, {
		topics: REDIS.EVENT.BALANCE_UPDATED,
		filter: BalanceResolver.balanceChangeFilter,
		description: 'Filters by accounts and contract expected in 0.2.0',
	})
	balanceUpdated(
		@Root() dBalance: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.BALANCE_UPDATED],
		@Args() _: BalanceSubscribe,
	) {
		return dBalance;
	}

	static balanceChangeFilter(
		{ payload: dBalance, args: { type } }: IBalanceSubscriptionFilterArgs,
	) {
		// TODO: Fix filter with EDB-80
		if (type && dBalance.type === type) return true;
		return false;
	}

}
