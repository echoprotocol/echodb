import AbstractResolver, { validateArgs } from './abstract.resolver';
import Operation from '../types/operation.type';
import OperationService from '../../../services/operation.service';
import TranasctionRepository from '../../../repositories/transaction.repository';
import Transaction from '../types/transaction.type';
import PaginatedResponse from '../types/paginated.response.type';
import * as REDIS from '../../../constants/redis.constants';
import { GetOperationsHistoryForm, NewOperationSubscribe } from '../forms/operation.forms';
import { Args, Resolver, Query, Subscription, Root, FieldResolver } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';

const paginatedBlocks = PaginatedResponse(Operation);

// TODO: register all enums in one file

interface INewOperationSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_OPERATION>;
	args: NewOperationSubscribe;
}

@Resolver(Operation)
export default class OperationResolver extends AbstractResolver {
	@inject static operationService: OperationService;
	@inject static transactionRepository: TranasctionRepository;

	constructor(
		private operationService: OperationService,
		private transactionRepository: TranasctionRepository,
	) {
		super();
	}

	// Query
	@Query(() => paginatedBlocks)
	@validateArgs(GetOperationsHistoryForm)
	getHistory(
		@Args() {
			count,
			offset,
			from,
			to,
			accounts,
			contracts,
			assets,
			tokens,
			operations,
			sort,
		}: GetOperationsHistoryForm,
	) {
		return this.operationService.getHistory(
			count,
			offset,
			{ from, to, accounts, contracts, assets, tokens, operations, sort },
		);
	}

	// FieldResolver
	@FieldResolver(() => Transaction)
	transaction(@Root('_tx') tx: Operation['_tx']) {
		return this.resolveMongoField(tx, this.transactionRepository);
	}

	// Subscription
	@Subscription(() => Operation, {
		topics: REDIS.EVENT.NEW_OPERATION,
		filter: ({
			payload: dOperation,
			args: { accounts, assets, tokens, operations },
		}: INewOperationSubscriptionFilterArgs) => {
			const relation = dOperation._relation;
			if (!relation) return false;
			if (accounts && !accounts.some((account) => (relation.from && relation.from.includes(account))
				|| (relation.to && relation.to.includes(account))
				|| (relation.accounts && relation.accounts.includes(account)))
			) {
				return false;
			}
			if (operations && !operations.includes(dOperation.id)) return false;
			if (assets && relation.assets && !assets.some((asset) => relation.assets.includes(asset))) return false;
			if (tokens && relation.token && !tokens.includes(relation.token)) return false;
			return true;
		},
	})
	newOperation(
		@Root() dOperation: Payload<REDIS.EVENT.NEW_OPERATION>,
		@Args() _: NewOperationSubscribe,
	) {
		return dOperation;
	}

}
