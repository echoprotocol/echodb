import AbstractResolver, { handleError } from './abstract.resolver';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import Balance from '../types/balance.type';
import BalanceService, { ERROR as BALANCE_SERVICE_ERROR } from '../../../services/balance.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as BALANCE from '../../../constants/balance.constants';
import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';

const paginatedBalances = PaginatedResponse(Balance);

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
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [404, 'account not found'],
	})
	getBalances(
		@Arg('account', { nullable: false }) account: string,
		@Arg('type', { nullable: true, description: 'balance type' }) type: BALANCE.TYPE,
	) {
		return this.balanceService.getBalance(account, type);
	}

	@Query(() => Balance)
	@handleError({
		[BALANCE_SERVICE_ERROR.ACCOUNT_NOT_FOUND]: [404],
		[BALANCE_SERVICE_ERROR.CONTRACT_NOT_FOUND]: [404],
	})
	getBalanceIn(
		@Arg('account', { nullable: false }) account: string,
		@Arg('contract', { nullable: false }) contract: string,
	) {
		return this.balanceService.getBalanceIn(account, contract);
	}

	// FIXME: do it in a better way
	@FieldResolver()
	account(@Root('_account') account: any) {
		if (isMongoObjectId(account)) return this.accountRepository.findByMongoId(account);
		if (this.accountRepository.isChild(account)) return account;
	}

	// FIXME: do it in a better way
	@FieldResolver()
	contract(@Root('_contract') contract: any) {
		if (isMongoObjectId(contract)) return this.contractRepository.findByMongoId(contract);
		if (this.contractRepository.isChild(contract)) return contract;
	}

}
