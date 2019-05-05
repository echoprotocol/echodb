import AbstractResolver, { handleError, validateArgs, validateSubscriptionArgs } from './abstract.resolver';
import AssetRepository from '../../../repositories/asset.repository';
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
import {
	GetBalanceInTokenForm,
	GetBalanceInAssetForm,
	GetBalancesForm,
	BalanceSubscribeForm,
} from '../forms/balance.forms';

interface IBalanceSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_BALANCE> | Payload<REDIS.EVENT.BALANCE_UPDATED>;
	args: BalanceSubscribeForm;
}
@Resolver(Balance)
export default class BalanceResolver extends AbstractResolver {
	@inject static assetRepository: AssetRepository;
	@inject static accountRepository: AccountRepository;
	@inject static contractRepository: ContractRepository;
	@inject static balanceService: BalanceService;

	constructor(
		private assetRepository: AssetRepository,
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
	getBalanceInToken(@Args() { account, contract }: GetBalanceInTokenForm) {
		return this.balanceService.getBalanceInToken(account, contract);
	}

	@Query(() => Balance)
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
		[BALANCE_SERVICE_ERROR.BALANCE_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
		[BALANCE_SERVICE_ERROR.ASSET_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	getBalanceInAsset(@Args() { account, asset }: GetBalanceInAssetForm) {
		return this.balanceService.getBalanceInAsset(account, asset);
	}

	// FieldResolver
	@FieldResolver()
	account(@Root('_account') id: Balance['_account']) {
		return this.resolveMongoField(id, [this.accountRepository, this.contractRepository]);
	}

	@FieldResolver()
	contract(@Root('type') type: Balance['type'], @Root('_contract') id: Balance['_contract']) {
		if (type !== BALANCE.TYPE.TOKEN) return null;
		return this.resolveMongoField(id, this.contractRepository);
	}

	@FieldResolver()
	asset(@Root('type') type: Balance['type'], @Root('_asset') id: Balance['_asset']) {
		if (type !== BALANCE.TYPE.ASSET) return null;
		return this.resolveMongoField(id, this.assetRepository);
	}

	// Subscription
	@Subscription(() => Balance, {
		topics: REDIS.EVENT.NEW_BALANCE,
		filter: BalanceResolver.balanceChangeFilter,
		description: 'Type and existence of the the corresponding filter are not allowed',
	})
	newBalance(
		@Root() dBalance: Payload<REDIS.EVENT.NEW_BALANCE>,
		@Args() _: BalanceSubscribeForm,
	) {
		return dBalance;
	}

	@Subscription(() => Balance, {
		topics: validateSubscriptionArgs(REDIS.EVENT.BALANCE_UPDATED, BalanceSubscribeForm),
		filter: BalanceResolver.balanceChangeFilter,
		description: 'Type and existence of the the corresponding filter are not allowed',
	})
	balanceUpdated(
		@Root() dBalance: Payload<REDIS.EVENT.BALANCE_UPDATED>,
		@Args() _: BalanceSubscribeForm,
	) {
		return dBalance;
	}

	static async balanceChangeFilter(
		{ payload: dBalance, args: { accounts, type, contracts, assets } }: IBalanceSubscriptionFilterArgs,
	) {
		if (!accounts.includes(dBalance._account.id)) return false;
		if (assets || contracts || type) {
			const byAsset = assets && dBalance.type === BALANCE.TYPE.ASSET && assets.includes(dBalance._asset.id);
			const byToken =
				contracts
				&& dBalance.type === BALANCE.TYPE.TOKEN
				&& contracts.includes(dBalance._contract.id);
			const byType = dBalance.type === type;

			if (type) {
				if (assets || contracts) {
					if (assets && !byAsset && !byType) return false;
					if (contracts && !byToken && !byType) return false;
				} else {
					return byType;
				}
			} else {
				if (assets && contracts) {
					if (!byAsset && !byToken) return false;
				} else {
					if (assets && !byAsset) return false;
					if (contracts && !byToken) return false;
				}
			}
		}
		return true;
	}

}
