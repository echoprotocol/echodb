import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ERC20TokenRepository from '../../../repositories/erc20-token.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN;

export default class SidechainErc20DepositTokenOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN;

	constructor(
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractRepository: ContractRepository,
		private erc20TokenRepository: ERC20TokenRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const erc20TokenContract = (await this.erc20TokenRepository.findOne({
			eth_addr: body.erc20_token_addr,
		})).contract;
		const [account, contract] = await Promise.all([
			await this.accountRepository.findById(body.account),
			await this.contractRepository.findByMongoId(erc20TokenContract),
		]);

		await this.balanceRepository.updateOrCreateByAccountAndContract(account._id, contract._id, body.value);
		return this.validateRelation({
			from: [],
			to: [body.account],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		try {
			const erc20Token = await this.erc20TokenRepository.findOne({
				eth_addr: body.erc20_token_addr,
			});
			const contract = await this.contractRepository.findByMongoId(erc20Token.contract);
			const tokenInfo = {
				precision: erc20Token.decimals,
				symbol: erc20Token.symbol,
				contractId: contract.id,
			};
			body.erc20_token_info = tokenInfo;
		} catch (e) {
			body.erc20_token_info = {};
		}
		return <any>body;
	}
}
