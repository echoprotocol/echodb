import { IERC20TokenObject, IContractObject } from 'echojs-lib/types/interfaces/objects';
import AbstractOperation from './abstract.operation';
import BalanceRepository from '../../../repositories/balance.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import EchoRepository from 'repositories/echo.repository';
import ERC20TokenRepository from 'repositories/erc20-token.repository';
import AccountRepository from 'repositories/account.repository';
import ContractRepository from 'repositories/contract.repository';
import { TDoc } from 'types/mongoose';
import { IBlock } from 'interfaces/IBlock';
import ContractService from 'services/contract.service';
import ContractCreateOperation from './contract.create.operation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN;

export default class SidechainErc20RegisterTokenOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN;

	constructor(
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractCreateOperation: ContractCreateOperation,
		private contractRepository: ContractRepository,
		private contractService: ContractService,
		private echoRepository: EchoRepository,
		private erc20TokenRepository: ERC20TokenRepository,
	) { super(); }

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, tokenId: ECHO.OPERATION_RESULT<OP_ID>, blockDocument: TDoc<IBlock>) {
		const [[token, contractObject, contract], registrarDocument] = await Promise.all([
			this.echoRepository.getObject(tokenId)
				.then((token) => Promise.all([
					Promise.resolve(token),
					this.echoRepository.getObject((<IERC20TokenObject>token).contract),
					this.echoRepository.getContract((<IERC20TokenObject>token).contract),
				])),
			this.accountRepository.findById('1.2.1'),
		]);
		const [contractDocument, ownerDocument] = await Promise.all([
			this.contractCreateOperation.fullfillContract({
				_block: blockDocument,
				_registrar: registrarDocument,
				// TODO: get `eth_accuracy` from chain when it will be possible
				eth_accuracy: true,
				id: contractObject.id,
				problem: false,
				supported_asset_id: (<IContractObject>contractObject).supported_asset_id,
				type: this.contractService.getTypeByCode(contract[1].code),
			}).then((contractToCreate) => this.contractRepository.create(contractToCreate)),
			this.accountRepository.findById((<IERC20TokenObject>token).owner),
		]);
		const [balance, account] = await Promise.all([
			this.echoRepository.getAccountTokenBalance(contractDocument.id, body.account),
			this.accountRepository.findById(body.account),
		]);
		await this.balanceRepository.updateOrCreateByAccountAndContract(account._id, contractDocument._id, balance);
		await this.erc20TokenRepository
			.create({ ...(<IERC20TokenObject>token), owner: ownerDocument, contract: contractDocument });
		return this.validateRelation({ from: [body.account], assets: [body.fee.asset_id] });
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<Y>,
		result: Y extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<Y> : unknown,
	) {
		const { body } = <IOperation<OP_ID>>operation;

		if (!result) {
			return <any>body;
		}

		const contractRegisterObject = <any>
				(await this.echoRepository.getObject(<ECHO.OPERATION_RESULT<OP_ID>>result));
		if (contractRegisterObject) {
			body.associated_contract = contractRegisterObject.contract;
		}

		return <any>body;
	}
}
