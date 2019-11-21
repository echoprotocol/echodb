import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ContractService from '../../../services/contract.service';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { getLogger } from 'log4js';
import { IBlock } from '../../../interfaces/IBlock';
import AssetRepository from 'repositories/asset.repository';
import BN from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CALL;

const logger = getLogger('contract.call');

export default class ContractInternalCallOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CALL;

	constructor(
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractBalanceRepository: ContractBalanceRepository,
		private contractRepository: ContractRepository,
		private contractService: ContractService,
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
}
