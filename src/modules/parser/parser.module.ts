import AbstractModule from '../abstract.module';
import InfoRepository from '../../repositories/info.repository';
import * as INFO from '../../constants/info.constants';
import * as TIME from '../../constants/time.constants';
import * as REDIS from '../../constants/redis.constants';
import EchoRepository from '../../repositories/echo.repository';
import BlockRepository from '../../repositories/block.repository';
import TransactionRepository from '../../repositories/transaction.repository';
import MemoryHelper from '../../helpers/memory.helper';
import RedisConnection from '../../connections/redis.connection';
import { Block } from 'echojs-lib';
import OperationManager from './operations/operation.manager';
import { getLogger } from 'log4js';

const logger = getLogger('parser.module');
const blockLogger = getLogger('parser.block');

export default class ParserModule extends AbstractModule {

	private bppLoggerTimeout: NodeJS.Timeout;
	private started = false;
	private from: number;
	private to: number;

	private parseTo(value: number) {
		if (value <= this.to) return;
		this.to = value;
		this.start();
	}

	constructor(
		readonly redisConnection: RedisConnection,
		readonly infoRepository: InfoRepository,
		readonly echoRepository: EchoRepository,
		readonly blockRepository: BlockRepository,
		readonly transactionRepository: TransactionRepository,
		readonly memoryHelper: MemoryHelper,
		readonly operationManager: OperationManager,
	) {
		super();
	}

	async init() {
		this.subscribeToBlockApply();
		const [lastParsedBlockNum, lastBlockNum] = await Promise.all([
			this.infoRepository.get(INFO.KEY.BLOCK_TO_PARSE_NUMBER),
			this.echoRepository.getLastBlockNum(),
		]);
		this.from = lastParsedBlockNum;
		this.parseTo(lastBlockNum);
	}

	// TODO: search for subscription returning blockNum
	subscribeToBlockApply() {
		this.echoRepository.subscribeToBlockApply(async () => {
			const blockNum =  await this.echoRepository.getLastBlockNum();
			logger.trace(`New block #${blockNum} appeared`);
			this.parseTo(blockNum);
		});
	}

	async start(): Promise<void> {
		if (!this.from || this.started) return;
		this.started = true;
		this.enableBlocksPerPeriodLogger();
		while (this.from <= this.to) {
			try {
				const block = await this.echoRepository.getBlock(this.from);
				await this.parseBlock(block);
				await this.infoRepository.set(INFO.KEY.BLOCK_TO_PARSE_NUMBER, this.from);
				this.from += 1;
			} catch (error) {
				logger.error(error);
				process.exit(1);
			}
		}
		this.disableBlocksPerPeriodLogger();
		this.started = false;
	}

	async parseBlock(block: Block) {
		// TODO: new_block hook after transaction
		blockLogger.trace(`Parsing block #${block.round}`);
		const dBlock = await this.blockRepository.create(block);
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

	private enableBlocksPerPeriodLogger(delay = TIME.SECOND, prevCount?: number) {
		const currentCount = this.from;
		if (prevCount !== undefined) {
			logger.info(`#${this.from} block | ${currentCount - prevCount} blocks per ${delay}ms`);
		}
		this.bppLoggerTimeout = setTimeout(() => this.enableBlocksPerPeriodLogger(delay, currentCount), delay);
	}

	private async disableBlocksPerPeriodLogger() {
		clearTimeout(this.bppLoggerTimeout);
	}

}
