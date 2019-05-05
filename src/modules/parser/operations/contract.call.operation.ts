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

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, result: ECHO.OPERATION_RESULT<OP_ID>) {
		const dContract = await this.contractRepository.findById(body.callee);
		if (dContract) {
			const amount = new BN(body.value.amount);
			if (amount) {
				const dAsset = await this.assetRepository.findById(body.value.asset_id);
				const dAccount = await this.accountRepository.findById(body.registrar);
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
			if (dContract.type === CONTRACT.TYPE.ERC20) return this.handleERC20(dContract, body, result);
		} else {
			logger.warn('contract not found, can not parse call');
		}
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contracts: body.callee,
		});
	}

	private async handleERC20(
		dContract: TDoc<IContract>,
		body: ECHO.OPERATION_PROPS<OP_ID>,
		result: ECHO.OPERATION_RESULT<OP_ID>,
	): Promise<IOperationRelation> {
		const [, contractResult] = await this.echoRepository.getContractResult(result);
		const relations = await this.contractService.handleErc20Logs(dContract, contractResult);
		return this.validateAndMergeRelations({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contracts: [body.callee],
			tokens: [body.callee],
		}, relations);
	}

}
