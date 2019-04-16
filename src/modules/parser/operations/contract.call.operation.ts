import AbstractOperation from './abstract.operation';
import BalanceRepository from 'repositories/balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ContractService from 'services/contract.service';
import EchoService from 'services/echo.service';
import EchoRepository from '../../../repositories/echo.repository';
import * as ECHO from '../../../constants/echo.constants';
import * as CONTRACT from '../../../constants/contract.constants';
import * as ERC20 from '../../../constants/erc20.constants';
import { decode } from 'echojs-contract';
import { IContract } from '../../../interfaces/IContract';
import { TDoc } from '../../../types/mongoose';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CALL;

export default class ContractCallOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CALL;

	constructor(
		readonly balanceRepository: BalanceRepository,
		readonly contractRepository: ContractRepository,
		readonly echoRepository: EchoRepository,
		readonly contractService: ContractService,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const dContract = await this.contractRepository.findById(body.callee);
		if (!dContract) {
			await this.echoService.checkAccounts([body.registrar]);
			return;
		}
		if (dContract.type === CONTRACT.TYPE.ERC20) return this.handleERC20(dContract, body);
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contract: body.callee,
		});
	}

	// FIXME: refactor ?
	private async handleERC20(dContract: TDoc<IContract>, body: ECHO.OPERATION_PROPS[OP_ID]) {
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
		const [dFrom, dTo] = await this.echoService.checkAccounts([from, to]);
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
