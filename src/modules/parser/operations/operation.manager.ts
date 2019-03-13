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

type OperationsMap = { [x in ECHO.OPERATION_ID]?: AbstractOperation<x> };

const logger = getLogger('operation.parser');

export default class OperationManager {
	private map: OperationsMap;

	constructor(
		readonly operationRepository: OperationRepository,
		readonly redisConnection: RedisConnection,
		accountCreateOperation: AccountCreateOperation,
		accountUpdateOperation: AccountUpdateOperation,
		accountTransferOperation: AccountTransferOperation,
		accountWhitelistOperation: AccountWhitelistOperation,
	) {
		this.map = {
			[accountCreateOperation.id]: accountCreateOperation,
			[accountTransferOperation.id]: accountTransferOperation,
			[accountUpdateOperation.id]: accountUpdateOperation,
			[accountWhitelistOperation.id]: accountWhitelistOperation,
			[accountTransferOperation.id]: accountTransferOperation,
		};
	}

	async parse<T extends ECHO.OPERATION_ID>(
		[id, body]: [T, ECHO.OPERATION_PROPS[T]],
		[_, result]: [unknown, ECHO.OPERATION_RESULT[T]],
		dTx: ITransactionDocument,
	) {
		const dOperation = await this.operationRepository.create([{ id, body, result, txId: dTx }]);
		if (!this.map[id]) {
			logger.warn(`Operation ${id} is not supported`);
			return;
		}
		logger.trace(`Parsing ${ECHO.OPERATION_ID[id]} [${id}] operation`);
		await this.map[id].parse(body, result);
		this.redisConnection.emit(REDIS.EVENT.NEW_OPERATION, dOperation);
	}

}
