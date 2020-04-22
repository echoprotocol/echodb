import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import EchoRepository from '../../../repositories/echo.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import { IERC20TokenObject } from 'echojs-lib/types/interfaces/objects';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN;

export default class SidechainErc20WithdrawTokenOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN;

	constructor(
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractRepository: ContractRepository,
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const contractId = (<IERC20TokenObject>(await this.echoRepository.getObject(body.erc20_token))).contract;
		const [account, contract] = await Promise.all([
			await this.accountRepository.findById(body.account),
			await this.contractRepository.findById(contractId),
		]);
		await this.balanceRepository.updateOrCreateByAccountAndContract(account._id, contract._id, `-${body.value}`);
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<Y>,
		result: Y extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<Y> : unknown,
	) {
		const { body } = <IOperation<OP_ID>>operation;
		if (result) {
			body.withdraw_id = (<ECHO.OPERATION_RESULT<OP_ID>>result);
		}
		return <any>body;
	}
}
