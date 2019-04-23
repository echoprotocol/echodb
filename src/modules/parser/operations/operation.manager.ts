import AbstractOperation from './abstract.operation';
import AccountUpgradeOperation from './account.upgrade.operation';
import BalanceService from '../../../services/balance.service';
import AccountCreateOperation from './account.create.operation';
import AccountUpdateOperation from './account.update.operation';
import AccountTransferOperation from './account.transfer.operation';
import AccountWhitelistOperation from './account.whitelist.operation';
import AssetCreateOperation from './asset.create.operation';
import AssetUpdateOperation from './asset.update.operation';
import AssetIssueOperation from './asset.issue.operation';
import ContractCreateOperation from './contract.create.operation';
import ContractCallOperation from './contract.call.operation';
import OperationRepository from '../../../repositories/operation.repository';
import RedisConnection from '../../../connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import * as OPERATION from '../../../constants/operation.constants';
import { IOperation, IOperationRelation } from 'interfaces/IOperation';
import { ITransaction } from '../../../interfaces/ITransaction';
import { TDoc } from '../../../types/mongoose';
import { getLogger } from 'log4js';

type OperationsMap = { [x in ECHO.OPERATION_ID]?: AbstractOperation<x> };

const logger = getLogger('operation.parser');

export default class OperationManager {
	private map: OperationsMap = {};

	constructor(
		readonly operationRepository: OperationRepository,
		readonly balanceService: BalanceService,
		readonly redisConnection: RedisConnection,
		accountCreateOperation: AccountCreateOperation,
		accountUpdateOperation: AccountUpdateOperation,
		accountTransferOperation: AccountTransferOperation,
		accountWhitelistOperation: AccountWhitelistOperation,
		assetCreateOperation: AssetCreateOperation,
		accountUpgradeOperation: AccountUpgradeOperation,
		assetUpdateOperation: AssetUpdateOperation,
		assetIssueOperation: AssetIssueOperation,
		contractCreateOperation: ContractCreateOperation,
		contractCallOperation: ContractCallOperation,
	) {
		const operations: AbstractOperation<ECHO.KNOWN_OPERATION>[] = [
			accountCreateOperation,
			accountTransferOperation,
			accountUpdateOperation,
			accountWhitelistOperation,
			assetCreateOperation,
			assetUpdateOperation,
			contractCreateOperation,
			contractCallOperation,
			accountUpgradeOperation,
			assetIssueOperation,
		];
		for (const operation of operations) {
			if (!operation.status) return;
			this.map[operation.id] = operation;
		}
	}

	// FIXME: emit all (not only parsed) operations
	async parse<T extends ECHO.KNOWN_OPERATION>(
		[id, body]: [T, T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_PROPS<T> : unknown],
		[_, result]: [unknown, T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<T> : unknown],
		dTx: TDoc<ITransaction>,
	) {
		const operation: IOperation<T> = {
			id,
			body,
			result,
			_tx: dTx,
			_relation: {},
		};
		if (this.map[id]) {
			operation._relation = await this.parseKnownOperation(id, body, result);
		} else {
			logger.warn(`Operation ${id} is not supported`);
			const feePayer = OPERATION.FEE_PAYER_FIELD[id];
			// FIXME: refactor
			if (feePayer) {
				await this.balanceService.takeFee((<any>body)[feePayer], (<any>body).fee);
			} else {
				logger.warn(`Fee of operation ${id} wasn't taken into account`);
			}
		}
		const dOperation = await this.operationRepository.create(operation);
		this.redisConnection.emit(REDIS.EVENT.NEW_OPERATION, dOperation);
	}

	async parseKnownOperation<T extends ECHO.KNOWN_OPERATION>(
		id: T,
		body: ECHO.OPERATION_PROPS<T>,
		result: ECHO.OPERATION_RESULT<T>,
	): Promise<IOperationRelation> {
		logger.trace(`Parsing ${ECHO.OPERATION_ID[id]} [${id}] operation`);
		const relation = <IOperationRelation>await this.map[id].parse(body, result);
		await this.balanceService.takeFee(relation.from[0], body.fee);
		return relation;
	}

}
