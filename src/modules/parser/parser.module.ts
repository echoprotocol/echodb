import AccountRepository from '../../repositories/account.repository';
import AbstractModule from '../abstract.module';
import BlockEngine from './block.engine';
import BlockRepository from '../../repositories/block.repository';
import AssetRepository from '../../repositories/asset.repository';
import EchoRepository from '../../repositories/echo.repository';
import MemoryHelper from '../../helpers/memory.helper';
import InfoRepository from '../../repositories/info.repository';
import OperationManager from './operations/operation.manager';
import RavenHelper from 'helpers/raven.helper';
import RedisConnection from '../../connections/redis.connection';
import TransactionRepository from '../../repositories/transaction.repository';
import * as INFO from '../../constants/info.constants';
import * as ECHO from '../../constants/echo.constants';
import * as REDIS from '../../constants/redis.constants';
import { Block } from 'echojs-lib';
import { getLogger } from 'log4js';

const logger = getLogger('parser.module');

export default class ParserModule extends AbstractModule {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly blockEngine: BlockEngine,
		readonly ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
		readonly infoRepository: InfoRepository,
		readonly assetRepository: AssetRepository,
		readonly echoRepository: EchoRepository,
		readonly blockRepository: BlockRepository,
		readonly transactionRepository: TransactionRepository,
		readonly memoryHelper: MemoryHelper,
		readonly operationManager: OperationManager,
	) {
		super();
	}

	async init() {
		const from = await this.infoRepository.get(INFO.KEY.BLOCK_TO_PARSE_NUMBER);
		if (from === 1) {
			await this.syncAllAccounts();
			await this.syncCoreAsset();
		}
		for await (const block of this.blockEngine.start(from)) {
			try {
				await this.parseBlock(block);
				await this.blockEngine.finished();
			} catch (error) {
				logger.error(error);
				this.ravenHelper.error(error, 'blockEngine#init');
				process.exit(1);
			}
		}
	}

	async parseBlock(block: Block) {
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

	async syncAllAccounts() { // use request limiter to retry failed
		logger.info('Parsing first block. Synchronizing all accounts');
		const batchSize = 1000;
		const total = await this.echoRepository.getAccountCount();
		const lastBatchSize = total % batchSize;
		const batchCount = (total - lastBatchSize) / batchSize + (lastBatchSize ? 1 : 0);
		const promises = [];
		for (let i = 0; i < batchCount; i += 1) {
			promises.push(this.fetchAccounts(i * batchSize, i === batchCount - 1 ? lastBatchSize : batchSize));
		}
		await Promise.all(promises);
	}

	async syncCoreAsset() {
		logger.info('Parsing first block. Synchronizing core asset');
		const [coreAsset] = await this.echoRepository.getAssets([ECHO.CORE_ASSET]);
		const account = await this.accountRepository.findById(coreAsset.issuer);
		return this.assetRepository.create([{
			id: coreAsset.id,
			_account: account,
			symbol: coreAsset.symbol,
			precision: coreAsset.precision,
			options: coreAsset.options,
			bitasset: coreAsset.options.flags ? coreAsset.bitasset : null,
		}]);
	}

	async fetchAccounts(from: number, batchSize: number) { // TODO: what to do on erorr?
		try {
			const ids = [];
			for (let i = from; i < from + batchSize; i += 1) {
				ids.push(`1.2.${i}`);
			}
			const accounts = await this.echoRepository.getAccounts(ids);
			await this.accountRepository.create(accounts);
			logger.trace(`accounts from 1.2.${from} to 1.2.${from + batchSize} are syncronized`);
		} catch (error) {
			logger.error(error);
			return;
		}
	}

}
