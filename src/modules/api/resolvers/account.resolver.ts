import AbstractResolver, { handleError } from './abstract.resolver';
import Account from '../types/account.type';
import AccountService, { ERROR as ACCOUNT_SERVICE_ERROR } from '../../../services/account.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as API from '../../../constants/api.constants';
import { Resolver, Query, Arg } from 'type-graphql';
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
	getAccount(
		@Arg('id', { nullable: true }) id?: string,
		@Arg('name', { nullable: true }) name?: string,
	) {
		return this.accountService.getAccount(id, name);
	}

	@Query(() => paginatedAccounts)
	getAccounts(
		@Arg('count', { defaultValue: API.PAGINATION.DEFAULT_COUNT }) count: number,
		@Arg('offset', { defaultValue: 0 }) offset: number,
	) {
		return this.accountService.getAccounts(count, offset);
	}

}
