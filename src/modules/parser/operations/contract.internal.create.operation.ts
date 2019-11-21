import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from 'types/mongoose';
import { IBlock } from 'interfaces/IBlock';
import * as CONTRACT from '../../../constants/contract.constants';
import AbstractOperation from './abstract.operation';
import { IOperationRelation } from 'interfaces/IOperation';
import EchoRepository from '../../../repositories/echo.repository';
import { IContract } from 'interfaces/IContract';
import ContractRepository from 'repositories/contract.repository';
import ContractService from 'services/contract.service';
import AssetRepository from '../../../repositories/asset.repository';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_INTERNAL_CREATE;

export default class ContractInternalCreateOperaiton extends AbstractOperation<OP_ID> {
	id: ECHO.OPERATION_ID = ECHO.OPERATION_ID.CONTRACT_INTERNAL_CREATE;

	constructor(
		readonly echoRepository: EchoRepository,
		readonly contractRepository: ContractRepository,
		readonly contractService: ContractService,
		readonly assetRepository: AssetRepository,
		readonly contractBalanceRepository: ContractBalanceRepository,
	) { super(); }

	public async parse(
		body: ECHO.OPERATION_PROPS<OP_ID>,
		_result: ECHO.OPERATION_RESULT<OP_ID>,
		dBlock: TDoc<IBlock>,
	): Promise<IOperationRelation> {
		const code = await this.echoRepository.getContract(body.new_contract).then((res) => (res as any)[1].code);
		const contract: IContract = await this.fullfillContract({
			_block: dBlock,
			id: body.new_contract,
			_registrar: await this.contractRepository.findById(body.caller),
			eth_accuracy: body.eth_accuracy,
			supported_asset_id: body.supported_asset_id || null,
			type: this.contractService.getTypeByCode(code),
			problem: false,
		});
		await this.createContractAndContractBalance(contract, body.value);
		return this.validateRelation({
			from: [body.caller],
			assets: [body.value.asset_id, body.supported_asset_id],
			contracts: contract.id,
		});
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

	private async fullfillContract(contract: IContract) {
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
