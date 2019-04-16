import AbstractResolver, { validateArgs } from './abstract.resolver';
import Operation from '../types/operation.type';
import OperationService from '../../../services/operation.service';
import PaginatedResponse from '../types/paginated.response.type';
import { GetOperationsHistoryForm } from '../forms/operation.forms';
import * as REDIS from '../../../constants/redis.constants';
import { Args, Resolver, Query, Subscription, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';

const paginatedBlocks = PaginatedResponse(Operation);

// TODO: register all enums in one file

@Resolver(Operation)
export default class OperationResolver extends AbstractResolver {
	@inject static operationService: OperationService;

	constructor(
		private operationService: OperationService,
	) {
		super();
	}

	// Query
	@Query(() => paginatedBlocks)
	@validateArgs(GetOperationsHistoryForm)
	getHistory(
		@Args() { count, offset, from, to, accounts, contracts, assets, tokens, operations }: GetOperationsHistoryForm,
	) {
		return this.operationService.getHistory(
			count,
			offset,
			{ from, to, accounts, contracts, assets, tokens, operations },
		);
	}

	// Subscription
	@Subscription(() => Operation, {
		topics: REDIS.EVENT.NEW_OPERATION,
	})
	newOperation(
		@Root() dOperation: Payload<REDIS.EVENT.NEW_OPERATION>,
	) {
		return dOperation;
	}

}
