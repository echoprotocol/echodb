import AbstractModule from '../abstract.module';
import BlockEngine from './block.engine';
import BlockRepository from '../../repositories/block.repository';
import EchoService from '../../services/echo.service';
import EchoRepository from '../../repositories/echo.repository';
import MemoryHelper from '../../helpers/memory.helper';
import OperationManager from './operations/operation.manager';
import RedisConnection from '../../connections/redis.connection';
import TransactionRepository from '../../repositories/transaction.repository';
import * as REDIS from '../../constants/redis.constants';
import { Block } from 'echojs-lib';
import { getLogger } from 'log4js';

const logger = getLogger('parser.module');

export default class ParserModule extends AbstractModule {

	constructor(
		readonly blockEngine: BlockEngine,
		readonly redisConnection: RedisConnection,
		readonly echoRepository: EchoRepository,
		readonly echoService: EchoService,
		readonly blockRepository: BlockRepository,
		readonly transactionRepository: TransactionRepository,
		readonly memoryHelper: MemoryHelper,
		readonly operationManager: OperationManager,
	) {
		super();
	}

	async init() {
		for await (const block of this.blockEngine.start()) {
			try {
				await this.parseBlock(block);
				await this.blockEngine.finished();
			} catch (error) {
				logger.error(error);
				process.exit(1);
			}
		}
	}

	async parseBlock(block: Block) {
		const [dBlock] = await Promise.all([
			this.blockRepository.create(block),
			this.echoService.checkAccounts([block.account]),
		]);
		for (const tx of block.transactions) {
			logger.trace(`Parsing block #${block.round} tx #${tx.ref_block_prefix}`);
			const dTx = await this.transactionRepository.create({ ...tx, _block: dBlock });
			for (const [i, operation] of tx.operations.entries()) {
				await this.operationManager.parse(operation, tx.operation_results[i], dTx);
			}
			this.redisConnection.emit(REDIS.EVENT.NEW_TRANSACTION, dTx);
		}
		this.redisConnection.emit(REDIS.EVENT.NEW_BLOCK, dBlock);
	}

}
