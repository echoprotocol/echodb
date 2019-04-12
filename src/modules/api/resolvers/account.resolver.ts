import AbstractResolver, { handleError } from './abstract.resolver';
import Account from '../types/account.type';
import AccountOwnerChangedSubscription from '../types/account.owner.changed.subscription';
import AccountService, { ERROR as ACCOUNT_SERVICE_ERROR } from '../../../services/account.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as REDIS from '../../../constants/redis.constants';
import { AccountForm, AccountsForm } from '../forms/account.forms';
import { Resolver, Query, Args, Subscription, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';

const paginatedAccounts = PaginatedResponse(Account);

@Resolver(Account)
export default class AccountResolver extends AbstractResolver {
	@inject static accountService: AccountService;

	constructor(
		private accountService: AccountService,
	) {
		super();
	}

	@Query(() => Account)
	@handleError({
		[ACCOUNT_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [404],
	})
	getAccount(@Args() { id, name }: AccountForm) {
		return this.accountService.getAccount(id, name);
	}

	@Query(() => paginatedAccounts)
	getAccounts(@Args() { count, offset }: AccountsForm) {
		return this.accountService.getAccounts(count, offset);
	}

	@Subscription(() => Account, {
		topics: REDIS.EVENT.ACCOUNT_UPDATED,
	})
	accountUpdated(
		@Root() accountId: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.ACCOUNT_UPDATED],
	) {
		return this.accountService.getAccount(accountId);
	}

	@Subscription(() => AccountOwnerChangedSubscription, {
		topics: REDIS.EVENT.ACCOUNT_OWNER_CHANGED,
	})
	async accountOwnerChanged(
		@Root() owners: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.ACCOUNT_OWNER_CHANGED],
	) {
		const dAccounts = await Promise.all([
			this.accountService.getAccount(owners.new),
			this.accountService.getAccount(owners.old),
		]);
		return { new: dAccounts[0], old: dAccounts[1] };
	}

	@Subscription(() => Account, {
		topics: REDIS.EVENT.NEW_ACCOUNT,
	})
	newAccount(
		@Root() dAccount: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.NEW_ACCOUNT],
	) {
		return dAccount;
	}

}
