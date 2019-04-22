import AbstractResolver, { validateArgs, handleError } from './abstract.resolver';
import Transaction from '../types/transaction.type';
import { GetTransactionsByBlockForm } from '../forms/transaction.forms';
import TransactionService, { ERROR as TRANSACTION_SERVICE_ERROR } from '../../../services/transaction.service';
import BlockRepository from '../../../repositories/block.repository';
import Block from '../types/block.type';
import * as HTTP from '../../../constants/http.constants';
import { Resolver, Query, Args, FieldResolver, Root  } from 'type-graphql';
import { inject } from '../../../utils/graphql';

@Resolver(Transaction)
export default class TransactionResolver extends AbstractResolver {
	@inject static transactionService: TransactionService;
	@inject static blockRepository: BlockRepository;

	constructor(
		private transactionService: TransactionService,
		private blockRepository: BlockRepository,
	) {
		super();
	}

	// Query
	@Query(() => [Transaction])
	@handleError({
		[TRANSACTION_SERVICE_ERROR.BLOCK_NOT_FOUND]: [HTTP.CODE.NOT_FOUND],
	})
	@validateArgs(GetTransactionsByBlockForm)
	getTransactionsByBlock(@Args() { block }: GetTransactionsByBlockForm) {
		return this.transactionService.getTransactionsByBlock(block);
	}

	// FiedlResolver
	@FieldResolver(() => Block)
	block(@Root('_block') id: Transaction['_block']) {
		return this.resolveMongoField(id, this.blockRepository);
	}

}
