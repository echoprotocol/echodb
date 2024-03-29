import * as config from 'config';
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
import ContractRepository from '../../repositories/contract.repository';
import TransactionRepository from '../../repositories/transaction.repository';
import AccountService from '../../services/account.service';
import BlockService from '../../services/block.service';
import ContractService from '../../services/contract.service';
import * as INFO from '../../constants/info.constants';
import * as ECHO from '../../constants/echo.constants';
import * as REDIS from '../../constants/redis.constants';
import * as COMMITTEE  from '../../constants/committee.constants';

import { getLogger } from 'log4js';
import { TDoc } from 'types/mongoose';
import { ITransactionExtended } from 'interfaces/ITransaction';
import { BlockWithInjectedVirtualOperations } from 'interfaces/IBlock';
import { IContract } from 'interfaces/IContract';
import { IOperation } from 'interfaces/IOperation';
import { TDocument } from 'types/mongoose/tdocument';

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
		readonly blockService: BlockService,
		readonly contractService: ContractService,
		readonly transactionRepository: TransactionRepository,
		readonly accountService: AccountService,
		readonly memoryHelper: MemoryHelper,
		readonly operationManager: OperationManager,
		readonly contractRepository: ContractRepository,
	) {
		super();
	}

	async init() {
		let from = await this.infoRepository.get(INFO.KEY.BLOCK_TO_PARSE_NUMBER);
		logger.trace(`Inited from block #${from}`);
		if (from === 0) {
			await this.syncAllAccounts();
			await this.syncCoreAsset();
			await this.syncCommitteeMembers();
			await this.parseZeroBlock();
			await this.syncContracts();
			from += 1;
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

	async parseBlock(block: BlockWithInjectedVirtualOperations) {
		try {
			const dBlock = await this.blockRepository.create(block);
			if (block.transactions.length === 0 && block.unlinked_virtual_operations.length === 0) {
				logger.trace(`Skipping no-transactions block #${block.round}`);
			}

			const dOperations: TDocument<IOperation<ECHO.OPERATION_ID>>[] = [];
			let virtualOpIndex = 0;
			for (const virtualOperation of block.unlinked_virtual_operations) {
				const dOperation = await this.operationManager.parse(
					virtualOperation.op,
					virtualOperation.result,
					null,
					dBlock,
					virtualOpIndex,
					0,
					null,
					true,
				);
				dOperations.push(dOperation);
				virtualOpIndex += 1;
			}
			let txIndex = 0;
			for (const tx of block.transactions) {
				logger.trace(`Parsing block #${block.round} tx #${tx.ref_block_prefix}`);
				const transactionHex = await this.echoRepository.getTransactionHex(tx);
				const dTx = <TDoc<ITransactionExtended>>await this.transactionRepository.create({
					...tx,
					trx_index: txIndex,
					trx_hex: transactionHex,
					_block: dBlock,
				});

				for (const [opIndex, operation] of tx.operations.entries()) {
					const dOperation = await this.operationManager.parse(
						operation,
						tx.operation_results[opIndex],
						dTx,
						dBlock,
						opIndex,
						txIndex,
						null,
						false,
						transactionHex,
					);
					dOperations.push(dOperation);
				}
				txIndex += 1;
				this.redisConnection.emit(REDIS.EVENT.NEW_TRANSACTION, dTx);
			}

			await this.accountService.updateAccountsConcentrationRate();
			const updatedBlock = await this.blockService.updateBlockAfterParsing(block);
			await this.operationManager.updateOperationsAfterBlockSaving(dOperations);
			this.redisConnection.emit(REDIS.EVENT.NEW_BLOCK, updatedBlock);
		} catch (error) {
			logger.error(`Block ${this.blockEngine.getCurrentBlockNum()}`, error);
			if (config.parser.exitOnError) process.exit(1);
			return;
		}
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
		const coreAssets = await this.echoRepository.getAssets(
			[ECHO.CORE_ASSET, ECHO.EETH_ASSET, ECHO.EBTC_ASSET, ECHO.SETH_ASSET, ECHO.SBTC_ASSET],
		);
		const coreAssetsPromises = coreAssets.map(async(coreAsset) => {
			if (!coreAsset) {
				return;
			}
			const dAccount = await this.accountRepository.findById(coreAsset.issuer);
			await this.assetRepository.create([{
				bitasset: !coreAsset.bitasset ? null : {
					...coreAsset.bitasset,
					current_feed_publication_time: new Date(coreAsset.bitasset.current_feed_publication_time),
				},
				id: coreAsset.id,
				_account: dAccount,
				symbol: coreAsset.symbol,
				precision: coreAsset.precision,
				options: coreAsset.options,
				dynamic: coreAsset.dynamic,
			}]);
		});
		await Promise.all(coreAssetsPromises);
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

	async syncCommitteeMembers() {
		logger.info('Parsing first block. Synchronizing committee members');
		const currentCommitteeMembersObjects = await this.echoRepository.lookupCommitteeMemberAccounts();
		const transformedCommitteeMembersIds = currentCommitteeMembersObjects.map((value: string[]) => value[1]);
		const committeeMembers = await this.echoRepository.getCommitteeMembers(transformedCommitteeMembersIds);
		const firstBlock = await this.echoRepository.getBlock(1);
		const updatedAccounts = committeeMembers.map((committee: any) => {
			const { id: committee_member_id, committee_member_account: id, eth_address, btc_public_key } = committee;

			const committee_options = {
				eth_address,
				btc_public_key,
				committee_member_id,
				status: COMMITTEE.STATUS.ACTIVE,
				proposal_operation: '',
				approves_count: 0,
				last_status_change_time: firstBlock.timestamp,
				last_executed_operation: '',
			};

			return this.accountRepository.findOneAndUpdate({ id }, { committee_options });
		});

		await Promise.all(updatedAccounts);
	}

	async parseZeroBlock() {
		logger.info('Parsing first block. Synchronizing zero block');
		const block = await this.echoRepository.getBlockWithInjectedVirtualOperations(0);
		await this.parseBlock(block);
		await this.infoRepository.set(INFO.KEY.BLOCK_TO_PARSE_NUMBER, 1);
	}

	// Call only after syncCommitteeMembers and parseZeroBlock methods
	async syncContracts() {
		logger.info('Parsing first block. Synchronizing base contracts');
		await Promise.all(ECHO.BASE_CONTRACTS.map(async (contractId) => {
			const echoContract: any = await this.echoRepository.getObject(contractId);
			const fullContract = await this.echoRepository.getContract(contractId);
			if (!(echoContract && fullContract)) {
				return;
			}
			const bytecode = fullContract[1].code;
			const committeeMember = await this.accountRepository.findOne({ id: echoContract.owner });

			const contract: IContract = {
				id: contractId,
				_registrar: committeeMember._id,
				eth_accuracy: echoContract.eth_accuracy,
				supported_asset_id: echoContract.supported_asset_id,
				type: this.contractService.getTypeByCode(bytecode),
				_block: null,
				problem: false,
			};
			await this.contractRepository.create(contract);
		}));
	}

}
