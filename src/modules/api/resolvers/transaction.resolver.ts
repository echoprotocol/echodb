import 'reflect-metadata';
import AbstractResolver, { validateArgs, handleError } from './abstract.resolver';
import TransactionType from '../types/transaction.type';
import TransactionForm from '../forms/transaction.forms';
import TransactionService, { ERROR as TRANSACTION_SERVICE_ERROR } from '../../../services/transaction.service';
import BlockRepository from '../../../repositories/block.repository';
import Block from '../types/block.type';
import { Resolver, Query, Args, FieldResolver, Root  } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { MongoId } from '../../../types/mongoose';

@Resolver(TransactionType)
export default class TransactionResolver extends AbstractResolver {
	@inject static transactionService: TransactionService;
	@inject static blockRepository: BlockRepository;

	constructor(
		private transactionService: TransactionService,
		private blockRepository: BlockRepository,
	) {
		super();
	}

	@Query(() => [TransactionType])

	@handleError({
		[TRANSACTION_SERVICE_ERROR.BLOCK_NOT_FOUND]: [404],
	})
	@validateArgs(TransactionForm)
	async getTransactionsByBlock(@Args() { block }: TransactionForm) {
		return this.transactionService.getTransactionsByBlock(block);
	}

	@FieldResolver(() => Block)
	block(@Root('_block') blockMongoId: MongoId) {
		return this.blockRepository.findByMongoId(blockMongoId);
	}

}
