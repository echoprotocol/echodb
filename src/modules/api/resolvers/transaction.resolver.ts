import 'reflect-metadata';
import AbstractResolver, { handleError } from './abstract.resolver';
import TransactionType from '../types/transaction.type';
import TransactionService, { ERROR as TRANSACTION_SERVICE_ERROR } from '../../../services/transaction.service';
import { Resolver, Query, Arg } from 'type-graphql';
import { inject } from '../../../utils/graphql';

@Resolver(TransactionType)
export default class TransactionResolver extends AbstractResolver {
	@inject static transactionService: TransactionService;

	constructor(
		private transactionService: TransactionService,
	) {
		super();
	}

	@Query(() => [TransactionType])
	@handleError({
		[TRANSACTION_SERVICE_ERROR.BLOCK_NOT_FOUND]: [404],
	})
	async getTransactionsByBlock(
		@Arg('block', { nullable: false })
		block: number,
	) {
		return this.transactionService.getTransactionsByBlock(block);
	}

}
