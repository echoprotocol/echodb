import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ContractService from 'services/contract.service';
import EchoRepository from '../../../repositories/echo.repository';
import * as ECHO from '../../../constants/echo.constants';
import * as CONTRACT from '../../../constants/contract.constants';
import * as ERC20 from '../../../constants/erc20.constants';
import { decode } from 'echojs-contract';
import { IContract } from '../../../interfaces/IContract';
import { TDoc } from '../../../types/mongoose';
import { getLogger } from 'log4js';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CALL;

const logger = getLogger('contract.call');

export default class ContractCallOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CALL;

	constructor(
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly contractBalanceRepository: ContractBalanceRepository,
		readonly contractRepository: ContractRepository,
		readonly contractService: ContractService,
		readonly echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const dContract = await this.contractRepository.findById(body.callee);
		if (dContract) {
			await this.contractBalanceRepository.updateOrCreate(
				dContract,
				body.value.asset_id,
				body.value.amount.toString(),
				{ append: true },
			);
			if (dContract.type === CONTRACT.TYPE.ERC20) return this.handleERC20(dContract, body);
		} else {
			logger.warn('contract not found, can not parse call');
		}
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contract: body.callee,
		});
	}

	// FIXME: refactor ?
	private async handleERC20(dContract: TDoc<IContract>, body: ECHO.OPERATION_PROPS<OP_ID>) {
		const method = ERC20.METHOD.MAP[body.code.substring(0, 8)];
		if (!method) return;
		const [name, parameters] = method;
		const code = body.code.substring(8);
		const commonRelation = {
			assets: [body.fee.asset_id],
			token: body.callee,
			contract: body.callee,
		};
		switch (name) {
			case ERC20.METHOD_NAME.TRANSFER: {
				const [to] = <[string]>decode(code, parameters);
				await this.updateAccountBalances(dContract, body.registrar, to);
				return this.validateRelation({
					...commonRelation,
					to,
					from: [body.registrar],
				});
			}
			case ERC20.METHOD_NAME.TRANSFER_FROM: {
				const [from, to] = <[string, string]>decode(code, parameters);
				await this.updateAccountBalances(dContract, from, to);
				return this.validateRelation({
					...commonRelation,
					to,
					from: [body.registrar, from],
				});
			}
			default:
				return;
		}
	}

	async updateAccountBalances(dContract: TDoc<IContract>, from: string, to: string) {
		const [dFrom, dTo] = await this.accountRepository.findManyByIds([from, to]);
		const [fromBalance, toBalance] = await Promise.all([
			this.echoRepository.getAccountTokenBalance(dContract.id, from),
			this.echoRepository.getAccountTokenBalance(dContract.id, to),
		]);
		await Promise.all([
			this.balanceRepository.updateOrCreateByAccountAndContract(dFrom, dContract, fromBalance),
			this.balanceRepository.updateOrCreateByAccountAndContract(dTo, dContract, toBalance),
		]);
	}

}
