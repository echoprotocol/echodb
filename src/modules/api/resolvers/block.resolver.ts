import AbstractResolver, { handleError, validateArgs } from './abstract.resolver';
import AccountService from '../../../services/account.service';
import Block from '../types/block.type';
import BlockService, { ERROR as BLOCK_SERVICE_ERROR } from '../../../services/block.service';
import PaginatedResponse from '../types/paginated.response.type';
import TransactionRepository from '../../../repositories/transaction.repository';
import Transaction from '../types/transaction.type';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import { GetBlockForm, GetBlocksForm, ExtendedHistoryForm } from '../forms/block.forms';
import { Resolver, Query, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';
import { MongoId } from '../../../types/mongoose';
import { Payload } from '../../../types/graphql';
import delegateRateObject from '../types/delegate.rate.type';

const paginatedBlocks = PaginatedResponse(Block);

@Resolver(Block)
export default class BlockResolver extends AbstractResolver {
	@inject static accountService: AccountService;
	@inject static blockService: BlockService;
	@inject static transactionRepository: TransactionRepository;

	constructor(
		private accountService: AccountService,
		private blockService: BlockService,
		private transactionRepository: TransactionRepository,
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

	@Query(() => delegateRateObject)
	@validateArgs(ExtendedHistoryForm)
	@handleError({
		[BLOCK_SERVICE_ERROR.INVALID_DATES]: [HTTP.CODE.BAD_REQUEST],
		[BLOCK_SERVICE_ERROR.INVALID_INTERVAL]: [HTTP.CODE.BAD_REQUEST],
		[BLOCK_SERVICE_ERROR.INVALID_HISTORY_PARAMS]: [HTTP.CODE.BAD_REQUEST],
	})
	getDelegationPercent(@Args() historyOpts?: ExtendedHistoryForm) {
		return this.blockService.getDelegationRate(historyOpts);
	}
}
