import AbstractOperation from './abstract.operation';
import AccountRepository from 'repositories/account.repository';
import ContractBalanceRepository from '../../../repositories/contract.balance.repository';
import ContractService from '../../../services/contract.service';
import ContractRepository from '../../../repositories/contract.repository';
import EchoRepository from '../../../repositories/echo.repository';
import RedisConnection from '../../../connections/redis.connection';
import * as CONTRACT from '../../../constants/contract.constants';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import { ethAddrToEchoId } from '../../../utils/format';
import { IContract } from '../../../interfaces/IContract';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CREATE;

export default class ContractCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CREATE;

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private contractService: ContractService,
		private echoRepository: EchoRepository,
		private contractBalanceRepository: ContractBalanceRepository,
		private redisConnection: RedisConnection,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, result: ECHO.OPERATION_RESULT<OP_ID>) {
		const [, contractResult] = await this.echoRepository.getContractResult(result);
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
			id: ethAddrToEchoId(hexAddr),
			_registrar: await this.accountRepository.findById(body.registrar),
			eth_accuracy: body.eth_accuracy,
			supported_asset_id: body.supported_asset_id || null,
			type: this.contractService.getTypeByCode(body.code),
			problem: false,
		});
		const dContract = await this.createContractAndContractBalance(contract, body.value);
		const commonRelations = {
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contracts: contract.id,
		};
		if (contract.type === CONTRACT.TYPE.ERC20) {
			const relations = await this.contractService.handleErc20Logs(dContract, contractResult);
			return this.validateAndMergeRelations(commonRelations, relations);
		}
		return this.validateRelation(commonRelations);
	}

	private async createContractAndContractBalance(contract: IContract, value: ECHO.IAmount) {
		const dContract = await this.contractRepository.create(contract);
		await this.contractBalanceRepository.fastCreate(
			dContract,
			value.asset_id,
			value.amount.toString(),
		);
		this.redisConnection.emit(REDIS.EVENT.NEW_CONTRACT, dContract);
		// TODO: emit new contract balance
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
