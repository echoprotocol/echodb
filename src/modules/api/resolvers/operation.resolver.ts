import AbstractResolver, { handleError, validateArgs, validateSubscriptionArgs } from './abstract.resolver';
import Operation from '../types/operation.type';
import OperationService, { ERROR } from '../../../services/operation.service';
import TranasctionRepository from '../../../repositories/transaction.repository';
import Transaction from '../types/transaction.type';
import PaginatedResponse from '../types/paginated.response.type';
import * as HTTP from '../../../constants/http.constants';
import * as REDIS from '../../../constants/redis.constants';
import { ExtendedHistoryForm } from '../forms/history.forms';
import {
	GetOperationsHistoryForm,
	NewOperationSubscribe,
	GetSubjectOperation,
	GetSingleOperation,
	GetSingleOperationByTrxHex,
} from '../forms/operation.forms';
import { Args, Resolver, Query, Subscription, Root, FieldResolver } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';
import Block from '../types/block.type';
import HistoryOperationCountObject from '../types/history.objects.count.type';
import BlockRepository from '../../../repositories/block.repository';
import HISTORY_INTERVAL_ERROR from '../../../errors/history.interval.error';

const paginatedOperations = PaginatedResponse(Operation);

// TODO: register all enums in one file

interface INewOperationSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_OPERATION>;
	args: NewOperationSubscribe;
}

@Resolver(Operation)
export default class OperationResolver extends AbstractResolver {
	@inject static operationService: OperationService;
	@inject static transactionRepository: TranasctionRepository;
	@inject static blockRepository: BlockRepository;

	constructor(
		private operationService: OperationService,
		private transactionRepository: TranasctionRepository,
		private blockRepository: BlockRepository,
	) {
		super();
	}

	// Query
	@Query(() => paginatedOperations)
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
			block,
		}: GetOperationsHistoryForm,
	) {
		return this.operationService.getHistory(
			count,
			offset,
			{ from, to, accounts, contracts, assets, tokens, operations, sort, block },
		);
	}

	// Query
	@Query(() => HistoryOperationCountObject)
	@validateArgs(ExtendedHistoryForm)
	@handleError({
		[HISTORY_INTERVAL_ERROR.INVALID_DATES]: [HTTP.CODE.BAD_REQUEST],
		[HISTORY_INTERVAL_ERROR.INVALID_INTERVAL]: [HTTP.CODE.BAD_REQUEST],
		[HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS]: [HTTP.CODE.BAD_REQUEST],
	})
	getOperationCountHistory(@Args() historyOpts?: ExtendedHistoryForm) {
		return this.operationService.getOperationCountHistory(historyOpts);
	}

	@Query(() => paginatedOperations)
	@validateArgs(GetSubjectOperation)
	getSubjectOperations(
		@Args() {
			count,
			offset,
			subject,
			fromFilter,
			toFilter,
			accounts,
			contracts,
			assets,
			tokens,
			operations,
			sort,
		}: GetSubjectOperation,
		) {
		return this.operationService.getSubjectOperations(
			count,
			offset,
			subject,
			fromFilter,
			toFilter,
			{ accounts, contracts, assets, tokens, operations, sort },
		);
	}

	@Query(() => Operation, { nullable: true })
	@validateArgs(GetSingleOperation)
	@handleError({
		[ERROR.BLOCK_NOT_FOUND]: [HTTP.CODE.BAD_REQUEST],
	})
	getOperationByBlockAndPosition(
		@Args() {
			block,
			trxInBlock,
			opInTrx,
			isVirtual,
		}: GetSingleOperation,
	) {
		return this.operationService.getOperationByBlockAndPosition(block, trxInBlock, opInTrx, isVirtual);
	}

	@Query(() => Operation, { nullable: true })
	@validateArgs(GetSingleOperationByTrxHex)
	@handleError({
		[ERROR.TRANSACTION_NOT_FOUND]: [HTTP.CODE.BAD_REQUEST],
	})
	getOperationByTrxHexAndPosition(
		@Args() {
			trx_hex,
			opInTrx,
			isVirtual,
		}: GetSingleOperationByTrxHex,
	) {
		return this.operationService.getOperationByTrxHexAndPosition(trx_hex, opInTrx, isVirtual);
	}

	// FieldResolver
	@FieldResolver(() => Transaction)
	transaction(@Root('_tx') tx: Operation['_tx']) {
		return this.resolveMongoField(tx, this.transactionRepository);
	}

	// FieldResolver
	@FieldResolver(() => Block)
	block(@Root('block') block: Operation['block']) {
		return this.resolveMongoField(block, this.blockRepository);
	}

	// Subscription
	@Subscription(() => Operation, {
		topics: validateSubscriptionArgs(REDIS.EVENT.NEW_OPERATION, NewOperationSubscribe),
		filter: ({
			payload: dOperation,
			args: { accounts, assets, tokens, operations },
		}: INewOperationSubscriptionFilterArgs) => {
			const relation = dOperation._relation;
			if (!relation) return false;
			if (accounts && accounts.length && !accounts.some((account) => relation.from.includes(account)
				|| relation.to.includes(account)
				|| relation.accounts.includes(account))
			) {
				return false;
			}
			if (operations && operations.length && !operations.includes(dOperation.id)) return false;
			if (assets && assets.length && !assets.some((asset) => relation.assets.includes(asset))) return false;
			if (tokens && tokens.length && !tokens.some((token) => relation.tokens.includes(token))) return false;
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
