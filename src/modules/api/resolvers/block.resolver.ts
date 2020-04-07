import AbstractResolver, { handleError, validateArgs } from './abstract.resolver';
import AccountService from '../../../services/account.service';
import Block from '../types/block.type';
import BlockService, { ERROR as BLOCK_SERVICE_ERROR } from '../../../services/block.service';
import PaginatedResponse from '../types/paginated.response.type';
import TransactionRepository from '../../../repositories/transaction.repository';
import Transaction from '../types/transaction.type';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import { GetBlockForm, GetBlocksForm } from '../forms/block.forms';
import { HistoryForm, ExtendedHistoryForm } from '../forms/history.forms';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';
import { MongoId } from '../../../types/mongoose';
import { Payload } from '../../../types/graphql';
import FrozenBalancesData from '../types/frozen.data.type';
import HistoryBlockObject from '../types/history.block.type';
import OperationService from '../../../services/operation.service';
import DelegateRateObject from '../types/delegate.rate.type';
import DecentralizationRateObject from '../types/decentralization.rate.type';
import HISTORY_INTERVAL_ERROR from '../../../errors/history.interval.error';

const paginatedBlocks = PaginatedResponse(Block);

@Resolver(Block)
export default class BlockResolver extends AbstractResolver {
	@inject static accountService: AccountService;
	@inject static blockService: BlockService;
	@inject static transactionRepository: TransactionRepository;
	@inject static operationService: OperationService;

	constructor(
		private accountService: AccountService,
		private blockService: BlockService,
		private transactionRepository: TransactionRepository,
		private operationService: OperationService,
	) {
		super();
	}

	// Query
	@Query(() => Block)
	@handleError({
		[BLOCK_SERVICE_ERROR.BLOCK_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	@validateArgs(GetBlockForm)
	getBlock(@Args() { round }: GetBlockForm) {
		return this.blockService.getBlock(round);
	}

	// TODO: add filters
	@Query(() => paginatedBlocks)
	@validateArgs(GetBlocksForm)
	getBlocks(@Args() { count, offset }: GetBlocksForm) {
		return this.blockService.getBlocks(count, offset);
	}

	@Query(() => DelegateRateObject)
	@validateArgs(ExtendedHistoryForm)
	@handleError({
		[HISTORY_INTERVAL_ERROR.INVALID_DATES]: [HTTP.CODE.BAD_REQUEST],
		[HISTORY_INTERVAL_ERROR.INVALID_INTERVAL]: [HTTP.CODE.BAD_REQUEST],
		[HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS]: [HTTP.CODE.BAD_REQUEST],
	})
	getDelegationPercent(@Args() historyOpts?: ExtendedHistoryForm) {
		return this.blockService.getDelegationRate(historyOpts);
	}

	// Query
	@Query(() => DecentralizationRateObject)
	@validateArgs(ExtendedHistoryForm)
	@handleError({
		[HISTORY_INTERVAL_ERROR.INVALID_DATES]: [HTTP.CODE.BAD_REQUEST],
		[HISTORY_INTERVAL_ERROR.INVALID_INTERVAL]: [HTTP.CODE.BAD_REQUEST],
		[HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS]: [HTTP.CODE.BAD_REQUEST],
	})
	getDecentralizationRate(@Args() historyOpts?: ExtendedHistoryForm) {
		return this.blockService.getDecentralizationRate(historyOpts);
	}

	@FieldResolver()
	account(@Root('account') id: string) {
		return this.accountService.getAccount(id);
	}

	// FieldResolver
	@FieldResolver(() => [Transaction])
	transactions(@Root('_id') idOrValue: MongoId | MongoId[]) {
		if (isMongoObjectId(idOrValue)) return this.transactionRepository.findByBlockMongoId(<MongoId>idOrValue);
		return idOrValue;
	}

	// Subscription
	@Subscription(() => Block, {
		topics: REDIS.EVENT.NEW_BLOCK,
	})
	newBlock(
		@Root() block: Payload<REDIS.EVENT.NEW_BLOCK>,
	) {
		return block;
	}

	@Query(() => HistoryBlockObject)
	@validateArgs(HistoryForm)
	getBlocksAndOperationsCount(@Args() options: HistoryForm) {
		return {
			blocksCount: this.blockService.getBlocksCount(options),
			operationsCount: this.operationService.getOpsCount(options),
		};
	}

	@Query(() => FrozenBalancesData)
	@validateArgs(ExtendedHistoryForm)
	@handleError({
		[HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS]: [HTTP.CODE.BAD_REQUEST],
	})
	getFrozenBalancesData(@Args() historyOpts?: ExtendedHistoryForm) {
		return this.blockService.getFrozenData(historyOpts);
	}
}
