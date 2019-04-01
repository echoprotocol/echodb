import Operation from '../types/operation.type';
import OperationService from '../../../services/operation.service';
import PaginatedResponse from '../types/paginated.response.type';
import * as API from '../../../constants/api.constants';
import * as ECHO from '../../../constants/echo.constants';
import { Resolver, Query, Arg } from 'type-graphql';
import { inject } from '../../../utils/graphql';

const paginatedBlocks = PaginatedResponse(Operation);

// TODO: register all enums in one file

@Resolver(Operation)
export default class OperationResolver {
	@inject static operationService: OperationService;

	constructor(
		private operationService: OperationService,
	) {}

	@Query(() => paginatedBlocks)
	// FIXME: use keys enum
	getHistory(
		@Arg('from', () => [String], { nullable: true })
		from: string[],

		@Arg('to', () => [String], { nullable: true })
		to: string[],

		@Arg('accounts', () => [String], { nullable: true })
		accounts: string[],

		@Arg('contracts', () => [String], { nullable: true })
		contracts: string[],

		@Arg('assets', () => [String], { nullable: true })
		assets: string[],

		@Arg('tokens', () => [String], { nullable: true })
		tokens: string[],

		@Arg('operations', () => [ECHO.OPERATION_ID], { nullable: true })
		operations: ECHO.OPERATION_ID[],

		@Arg('count', { defaultValue: API.PAGINATION.DEFAULT_COUNT })
		count: number,

		@Arg('offset', { defaultValue: 0 })
		offset: number,
	) {
		return this.operationService.getHistory(
			count,
			offset,
			{ from, to, accounts, contracts, assets, tokens, operations },
		);
	}

}
