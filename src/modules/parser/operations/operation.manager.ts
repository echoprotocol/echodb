import { getLogger } from 'log4js';
import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import OperationRepository from '../../../repositories/operation.repository';
import { ITransactionDocument } from 'interfaces/ITransaction';
import RedisConnection from '../../../connections/redis.connection';
import AccountCreateOperation from './account.create.operation';
import AccountUpdateOperation from './account.update.operation';
import AccountTransferOperation from './account.transfer.operation';
import AccountWhitelistOperation from './account.whitelist.operation';
import AssetCreateOperation from './asset.create.operation';
import ContractCreateOperation from './contract.create.operation';
import ContractCallOperation from './contract.call.operation';
import { IOperation } from 'interfaces/IOperation';

type OperationsMap = { [x in ECHO.OPERATION_ID]?: AbstractOperation<x> };

const logger = getLogger('operation.parser');

export default class OperationManager {
	private map: OperationsMap = {};

	constructor(
		readonly operationRepository: OperationRepository,
		readonly redisConnection: RedisConnection,
		accountCreateOperation: AccountCreateOperation,
		accountUpdateOperation: AccountUpdateOperation,
		accountTransferOperation: AccountTransferOperation,
		accountWhitelistOperation: AccountWhitelistOperation,
		assetCreateOperation: AssetCreateOperation,
		contractCreateOperation: ContractCreateOperation,
		contractCallOperation: ContractCallOperation,
	) {
		const operations: AbstractOperation<ECHO.OPERATION_ID>[] = [
			accountCreateOperation,
			accountTransferOperation,
			accountUpdateOperation,
			accountWhitelistOperation,
			assetCreateOperation,
			contractCreateOperation,
			contractCallOperation,
		];
		for (const operation of operations) {
			if (!operation.status) return;
			this.map[operation.id] = operation;
		}

	}

	// FIXME: emit all (not only parsed) operations
	async parse<T extends ECHO.OPERATION_ID>(
		[id, body]: [T, ECHO.OPERATION_PROPS[T]],
		[_, result]: [unknown, ECHO.OPERATION_RESULT[T]],
		dTx: ITransactionDocument,
	) {
		const operation: IOperation<T> = {
			id,
			body,
			result,
			_tx: dTx,
			_relation: {},
		};
		if (!this.map[id]) {
			logger.warn(`Operation ${id} is not supported`);
		} else {
			logger.trace(`Parsing ${ECHO.OPERATION_ID[id]} [${id}] operation`);
			operation._relation = await this.map[id].parse(body, result);
		}
		const dOperation = await this.operationRepository.create(operation);
		this.redisConnection.emit(REDIS.EVENT.NEW_OPERATION, dOperation);
	}

}
