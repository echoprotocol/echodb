import AbstractResolver, { handleError } from './abstract.resolver';
import AccountService from '../../../services/account.service';
import Block from '../types/block.type';
import BlockService, { ERROR as BLOCK_SERVICE_ERROR } from '../../../services/block.service';
import BlockRepository from '../../../repositories/block.repository';
import PaginatedResponse from '../types/paginated.response.type';
import TransactionRepository from '../../../repositories/transaction.repository';
import Transaction from '../types/transaction.type';
import * as API from '../../../constants/api.constants';
import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';
import { MongoId } from '../../../types/mongoose';

const paginatedBlocks = PaginatedResponse(Block);

@Resolver(Block)
export default class BlockResolver extends AbstractResolver {
	@inject static accountService: AccountService;
	@inject static blockService: BlockService;
	@inject static blockRepository: BlockRepository;
	@inject static transactionRepository: TransactionRepository;

	constructor(
		private accountService: AccountService,
		private blockService: BlockService,
		private blockRepository: BlockRepository,
		private transactionRepository: TransactionRepository,
	) {
		super();
	}

	@Query(() => Block)
	@handleError({
		[BLOCK_SERVICE_ERROR.BLOCK_NOT_FOUND]: [404],
	})
	getBlock(
		@Arg('round', { nullable: false }) round: number,
	) {
		return this.blockService.getBlock(round);
	}

	// TODO: add filters
	@Query(() => paginatedBlocks)
	getBlocks(
		@Arg('count', { defaultValue: API.PAGINATION.DEFAULT_COUNT }) count: number,
		@Arg('offset', { defaultValue: 0 }) offset: number,
	) {
		return this.blockService.getBlocks(count, offset);
	}

	@FieldResolver()
	account(@Root('account') id: string) {
		return this.accountService.getAccount(id);
	}

	@FieldResolver(() => [Transaction])
	transactions(@Root('_id') id: MongoId) {
		if (isMongoObjectId(id)) return this.transactionRepository.findByBlockMongoId(id);
		if (this.blockRepository.isChild(id)) return this.transactionRepository.findByBlockMongoId(id);
	}

}
