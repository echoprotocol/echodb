import AbstractResolver, { handleError, validateArgs } from './abstract.resolver';
import Account from '../types/account.type';
import AccountOwnerChangedSubscription from '../types/account.owner.changed.subscription';
import AccountService, { ERROR as ACCOUNT_SERVICE_ERROR } from '../../../services/account.service';
import AccountRepository from '../../../repositories/account.repository';
import PaginatedResponse from '../types/paginated.response.type';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import { GetAccountForm, GetAccountsForm } from '../forms/account.forms';
import { Resolver, Query, Args, Subscription, Root, FieldResolver } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';
import { Document } from 'mongoose';
import { isMongoObjectId } from '../../../utils/validators';

const paginatedAccounts = PaginatedResponse(Account);

@Resolver(Account)
export default class AccountResolver extends AbstractResolver {
	@inject static accountService: AccountService;
	@inject static accountRepository: AccountRepository;

	constructor(
		private accountService: AccountService,
		private accountRepository: AccountRepository,
	) {
		super();
	}

	// Query
	@Query(() => Account, { description: GetAccountForm.description })
	@handleError({
		[ACCOUNT_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	@validateArgs(GetAccountForm)
	getAccount(@Args() { id, name }: GetAccountForm) {
		return this.accountService.getAccount(id, name);
	}

	@validateArgs(GetAccountsForm)
	@Query(() => paginatedAccounts)
	getAccounts(@Args() { count, offset }: GetAccountsForm) {
		return this.accountService.getAccounts(count, offset);
	}

	// FieldResolver
	@FieldResolver(() => Account)
	registrar(@Root('registrar') id: string | Document) {
		if (isMongoObjectId(id)) return this.accountRepository.findByMongoId(id);
		if (this.accountRepository.isChild(id)) return id;
		return this.accountRepository.findById(<string>id);
	}

	@FieldResolver(() => Account)
	referrer(@Root('referrer') id: string | Document) {
		if (isMongoObjectId(id)) return this.accountRepository.findByMongoId(id);
		if (this.accountRepository.isChild(id)) return id;
		return this.accountRepository.findById(<string>id);
	}

	@FieldResolver(() => Account)
	lifetime_referrer(@Root('lifetime_referrer') id: string | Document) {
		if (isMongoObjectId(id)) return this.accountRepository.findByMongoId(id);
		if (this.accountRepository.isChild(id)) return id;
		return this.accountRepository.findById(<string>id);
	}

	// Subscription
	@Subscription(() => Account, {
		topics: REDIS.EVENT.ACCOUNT_UPDATED,
	})
	accountUpdated(
		@Root() accountId: Payload<REDIS.EVENT.ACCOUNT_UPDATED>,
	) {
		return this.accountService.getAccount(accountId);
	}

	@Subscription(() => AccountOwnerChangedSubscription, {
		topics: REDIS.EVENT.ACCOUNT_OWNER_CHANGED,
	})
	async accountOwnerChanged(
		@Root() owners: Payload<REDIS.EVENT.ACCOUNT_OWNER_CHANGED>,
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
		@Root() dAccount: Payload<REDIS.EVENT.NEW_ACCOUNT>,
	) {
		return dAccount;
	}

}
