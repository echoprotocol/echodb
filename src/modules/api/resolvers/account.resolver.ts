import AbstractResolver, { handleError } from './abstract.resolver';
import Account from '../types/account.type';
import AccountService, { ERROR as ACCOUNT_SERVICE_ERROR } from '../../../services/account.service';
import PaginatedResponse from '../types/paginated.response.type';
import { AccountForm, AccountsForm } from '../forms/account.forms';
import { Resolver, Query, Args } from 'type-graphql';
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

}
