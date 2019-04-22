import AbstractResolver, { handleError, validateArgs } from './abstract.resolver';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import Balance from '../types/balance.type';
import BalanceService, { ERROR as BALANCE_SERVICE_ERROR } from '../../../services/balance.service';
import * as BALANCE from '../../../constants/balance.constants';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';
import { GetBalanceInForm, GetBalancesForm, BalanceSubscribeForm } from '../forms/balance.forms';

interface IBalanceSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_BALANCE> | Payload<REDIS.EVENT.BALANCE_UPDATED>;
	args: BalanceSubscribeForm;
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

	// Query
	@Query(() => [Balance])
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	@validateArgs(GetBalancesForm)
	getBalances(@Args() { accounts, type }: GetBalancesForm) {
		return this.balanceService.getBalances(accounts, type);
	}

	@Query(() => Balance)
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
		[BALANCE_SERVICE_ERROR.BALANCE_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
		[BALANCE_SERVICE_ERROR.CONTRACT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	getBalanceIn(@Args() { account, contract }: GetBalanceInForm) {
		return this.balanceService.getBalanceIn(account, contract);
	}

	// FieldResolver
	@FieldResolver()
	account(@Root('_account') id: Balance['_account']) {
		return this.resolveMongoField(id, this.accountRepository);
	}

	@FieldResolver()
	contract(@Root('type') type: Balance['type'], @Root('_contract') id: Balance['_contract']) {
		if (type !== BALANCE.TYPE.TOKEN) return null;
		return this.resolveMongoField(id, this.contractRepository);
	}

	// Subscription
	@Subscription(() => Balance, {
		topics: REDIS.EVENT.NEW_BALANCE,
		filter: BalanceResolver.balanceChangeFilter,
		description: 'Filters by accounts and contract expected in 0.2.0',
	})
	newBalance(
		@Root() dBalance: Payload<REDIS.EVENT.NEW_BALANCE>,
		@Args() _: BalanceSubscribeForm,
	) {
		return dBalance;
	}

	@Subscription(() => Balance, {
		topics: REDIS.EVENT.BALANCE_UPDATED,
		filter: BalanceResolver.balanceChangeFilter,
		description: 'Filters by accounts and contract expected in 0.2.0',
	})
	balanceUpdated(
		@Root() dBalance: Payload<REDIS.EVENT.BALANCE_UPDATED>,
		@Args() _: BalanceSubscribeForm,
	) {
		return dBalance;
	}

	static async balanceChangeFilter(
		{ payload: dBalance, args: { accounts, type, contract } }: IBalanceSubscriptionFilterArgs,
	) {
		if (!accounts.includes(dBalance._account.id)) return false;
		if (contract) {
			if (dBalance.type === BALANCE.TYPE.TOKEN) {
				return dBalance._contract.id === contract;
			}
		}
		if (type) return dBalance.type === type;
		return true;
	}

}
