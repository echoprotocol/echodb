import AbstractResolver, { validateArgs } from './abstract.resolver';
import Operation from '../types/operation.type';
import OperationService from '../../../services/operation.service';
import PaginatedResponse from '../types/paginated.response.type';
import OperationForm from '../forms/operation.forms';
import * as REDIS from '../../../constants/redis.constants';
import { Args, Resolver, Query, Subscription, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';

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

	@Query(() => paginatedBlocks)
	@validateArgs(OperationForm)
	getHistory(@Args() { count, offset, from, to, accounts, contracts, assets, tokens, operations }: OperationForm) {
		return this.operationService.getHistory(
			count,
			offset,
			{ from, to, accounts, contracts, assets, tokens, operations },
		);
	}

	@Subscription(() => Operation, {
		topics: REDIS.EVENT.NEW_OPERATION,
	})
	newOperation(
		@Root() dOperation: REDIS.EVENT_PAYLOAD_TYPE[REDIS.EVENT.NEW_OPERATION],
	) {
		return dOperation;
	}

}
