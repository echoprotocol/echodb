import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ContractService from '../../../services/contract.service';
import EchoRepository from '../../../repositories/echo.repository';
import * as CONTRACT from '../../../constants/contract.constants';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { getLogger } from 'log4js';
import { IOperationRelation } from '../../../interfaces/IOperation';
import { IContract } from '../../../interfaces/IContract';
import { IBlock } from '../../../interfaces/IBlock';
import AssetRepository from 'repositories/asset.repository';
import BN from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CALL;

const logger = getLogger('contract.call');

export default class ContractCallOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CALL;

	constructor(
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractBalanceRepository: ContractBalanceRepository,
		private contractRepository: ContractRepository,
		private contractService: ContractService,
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, _result: ECHO.OPERATION_RESULT<OP_ID>, _dBlock: TDoc<IBlock>) {
		const dContract = await this.contractRepository.findById(body.callee);
		if (dContract) {
			const amount = new BN(body.value.amount);
			const dAccount = await this.accountRepository.findById(body.registrar);
			const [dAsset] = await Promise.all([
				this.assetRepository.findById(body.value.asset_id),
				this.contractService.updateContractCallingAccounts(dContract, dAccount._id),
			]);
			if (amount) {
				await this.contractBalanceRepository.updateOrCreateByOwnerAndAsset(
					dContract,
					dAsset,
					amount.toString(),
					{ append: true },
				);
				await this.balanceRepository.updateOrCreateByAccountAndAsset(
					dAccount,
					dAsset,
					amount.negated().toString(),
					{ append: true },
				);
			}
		} else {
			logger.warn('contract not found, can not parse call');
		}
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contracts: body.callee,
		});
	}

	async postInternalParse(
		body: ECHO.OPERATION_PROPS<OP_ID>,
		result: ECHO.OPERATION_RESULT<OP_ID>,
		dBlock: TDoc<IBlock>,
		relations: IOperationRelation,
	) {
		const dContract = await this.contractRepository.findById(body.callee);
		if (dContract.type !== CONTRACT.TYPE.ERC20) {
			return relations;
		}
		return this.validateAndMergeRelations(relations, await this.handleERC20(dContract, body, result, dBlock));
	}

	private async handleERC20(
		dContract: TDoc<IContract>,
		body: ECHO.OPERATION_PROPS<OP_ID>,
		result: ECHO.OPERATION_RESULT<OP_ID>,
		dBlock: TDoc<IBlock>,
	): Promise<IOperationRelation> {
		const [, contractResult] = await this.echoRepository.getContractResult(result);
		const relations = await this.contractService.handleErc20Logs(dContract, contractResult, dBlock);
		return this.validateAndMergeRelations({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contracts: [body.callee],
			tokens: [body.callee],
		}, relations);
	}

}
