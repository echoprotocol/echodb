import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import AssetRepository from '../../../repositories/asset.repository';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';
import ContractService from '../../../services/contract.service';
import ContractRepository from '../../../repositories/contract.repository';
import EchoRepository from '../../../repositories/echo.repository';
import * as CONTRACT from '../../../constants/contract.constants';
import * as ECHO from '../../../constants/echo.constants';
import { ethAddrToEchoId } from '../../../utils/format';
import { IContract } from '../../../interfaces/IContract';
import { TDoc } from '../../../types/mongoose';
import { IBlock } from '../../../interfaces/IBlock';
import { IOperationRelation } from 'interfaces/IOperation';
import { getLogger } from 'log4js';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CREATE;

const logger = getLogger('contract.call');

export default class ContractCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CREATE;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private contractRepository: ContractRepository,
		private contractService: ContractService,
		private echoRepository: EchoRepository,
		private contractBalanceRepository: ContractBalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, result: ECHO.OPERATION_RESULT<OP_ID>, dBlock: TDoc<IBlock>) {
		const [contractType, contractResult] = await this.echoRepository.getContractResult(result);
		let contractId: string | null = null;
		if (contractType === 0) {
			const { exec_res: {
				new_address: hexAddr,
				code_deposit: codeDeposit,
			} } = contractResult;
			if (codeDeposit !== 'Success') {
				return this.validateRelation({
					from: [body.registrar],
					assets: [body.fee.asset_id],
				});
			}
			const contract: IContract = await this.fullfillContract({
				_block: dBlock,
				id: ethAddrToEchoId(hexAddr),
				_registrar: await this.accountRepository.findById(body.registrar),
				eth_accuracy: body.eth_accuracy,
				supported_asset_id: body.supported_asset_id || null,
				type: this.contractService.getTypeByCode(body.code),
				problem: false,
			});
			contractId = contract.id;
			await this.createContractAndContractBalance(contract, body.value);
		} else logger.warn('x86_64 contract creation parsing is not implemented');
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			...contractId === null ? {} : { contracts: contractId },
		});
	}

	async postInternalParse(
		_body: ECHO.OPERATION_PROPS<OP_ID>,
		result: ECHO.OPERATION_RESULT<OP_ID>,
		dBlock: TDoc<IBlock>,
		relations: IOperationRelation,
	) {
		const [contractType, contractResult] = await this.echoRepository.getContractResult(result);
		if (contractType === 1) return relations;
		const contract = await this.contractRepository.findById(ethAddrToEchoId(contractResult.exec_res.new_address));
		if (contract.type !== CONTRACT.TYPE.ERC20) return relations;
		const newRelations = await this.contractService.handleErc20Logs(contract, contractResult, dBlock);
		return this.validateAndMergeRelations(relations, newRelations);
	}

	private async createContractAndContractBalance(contract: IContract, value: ECHO.IAmount) {
		const [dContract, dAsset] = await Promise.all([
			this.contractRepository.createAndEmit(contract),
			this.assetRepository.findById(value.asset_id),
		]);
		const amount = value.amount.toString();
		if (amount !== '0') {
			await this.contractBalanceRepository.createByOwnerAndAsset(
				dContract, dAsset, amount,
			);
		}
		return dContract;
	}

	public async fullfillContract(contract: IContract) {
		if (contract.type === CONTRACT.TYPE.ERC20) {
			const [totalSupply, name, symbol, decimals] = await Promise.all([
				this.echoRepository.getTokenTotalSupply(contract.id),
				this.echoRepository.getTokenName(contract.id),
				this.echoRepository.getTokenSymbol(contract.id),
				this.echoRepository.getTokenDecimals(contract.id),
			]);
			contract.token_info = {
				name, symbol, decimals, total_supply: totalSupply,
			};
		}
		return contract;
	}

}
