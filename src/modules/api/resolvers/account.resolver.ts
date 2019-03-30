import 'reflect-metadata';
import Account from '../types/account.type';
import AccountService from '../../../services/account.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as API from '../../../constants/api.constants';
import { Resolver, Query, Arg } from 'type-graphql';
import { inject } from '../../../utils/graphql';

const paginatedAccounts = PaginatedResponse(Account);

@Resolver(Account)
export default class AccountResolver {
	@inject static accountService: AccountService;

	constructor(
		private accountService: AccountService,
	) {}

	@Query(() => Account)
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
