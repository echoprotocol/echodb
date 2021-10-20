import AbstractOperation from './abstract.operation';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ContractService from '../../../services/contract.service';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { getLogger } from 'log4js';
import { IBlock } from '../../../interfaces/IBlock';
import AssetRepository from 'repositories/asset.repository';
import BN from 'bignumber.js';
import { validators } from 'echojs-lib';
import { IContract } from 'interfaces/IContract';
import { IAccount } from 'interfaces/IAccount';
import AccountRepository from 'repositories/account.repository';
import { IAsset } from 'interfaces/IAsset';
import BalanceRepository from 'repositories/balance.repository';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_INTERNAL_CALL;

const logger = getLogger('contract.internal.call');

export default class ContractInternalCallOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_INTERNAL_CALL;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
		private contractBalanceRepository: ContractBalanceRepository,
		private contractRepository: ContractRepository,
		private contractService: ContractService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, _result: ECHO.OPERATION_RESULT<OP_ID>, _dBlock: TDoc<IBlock>) {
		const calleeIsContract: boolean = validators.isContractId(body.callee);
		const dCallee = calleeIsContract ? await this.contractRepository.findById(body.callee) :
			await this.accountRepository.findById(body.callee);
		if (dCallee) {
			const amount = new BN(body.value.amount);
			const dCaller = await this.contractRepository.findById(body.caller);
			const [dAsset] = await Promise.all([
				this.assetRepository.findById(body.value.asset_id),
				...calleeIsContract ?
					[this.contractService.updateContractCaller(dCallee as TDoc<IContract>, body.caller)] : [],
			] as [Promise<IAsset>, ...Promise<any>[]]);
			if (amount) {
				if (calleeIsContract) {
					await this.contractBalanceRepository.updateOrCreateByOwnerAndAsset(
						dCallee as TDoc<IContract>,
						dAsset,
						amount.toString(),
						{ append: true },
					);
				} else {
					await this.balanceRepository.updateOrCreateByAccountAndAsset(
						dCallee as TDoc<IAccount>,
						dAsset,
						amount.toString(),
						{ append: true },
					);
				}
				await this.contractBalanceRepository.updateOrCreateByOwnerAndAsset(
					dCaller,
					dAsset,
					amount.negated().toString(),
					{ append: true },
				);
			}
		} else {
			logger.warn(`callee ${body.callee} not found, can not parse call`);
		}
		return this.validateRelation({
			from: [body.caller],
			to: body.method === '' ? [body.callee] : [],
			assets: [body.value.asset_id],
			contracts: body.method === '' ? [] : [body.caller],
		});
	}
}
