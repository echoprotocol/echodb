import AbstractOperation from './abstract.operation';
import ContractRepository from '../../../repositories/contract.repository';
import EchoRepository from '../../../repositories/echo.repository';
import EchoService from '../../../services/echo.service';
import RedisConnection from '../../../connections/redis.connection';
import * as CONTRACT from '../../../constants/contract.constants';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import ContractService from '../../../services/contract.service';
import { ethAddrToEchoId } from '../../../utils/format';
import { IContract } from '../../../interfaces/IContract';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CREATE;

export default class ContractCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CREATE;

	constructor(
		readonly contractRepository: ContractRepository,
		readonly contractService: ContractService,
		readonly echoService: EchoService,
		readonly echoRepository: EchoRepository,
		readonly redisConnection: RedisConnection,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID], result: ECHO.OPERATION_RESULT[OP_ID]) {
		const [dAccount] = await this.echoService.checkAccounts([body.registrar]);
		const [, { exec_res: { new_address: hexAddr } }] = await this.echoRepository.getContractResult(result);
		const contract: IContract = {
			id: ethAddrToEchoId(hexAddr),
			_registrar: dAccount,
			eth_accuracy: body.eth_accuracy,
			supported_asset_id: body.supported_asset_id || null,
			type: this.contractService.getTypeByCode(body.code),
		};
		if (contract.type === CONTRACT.TYPE.ERC20) {
			const [totalSupply, name, symbol] = await Promise.all([
				this.echoRepository.getTokenTotalSupply(contract.id),
				this.echoRepository.getTokenName(contract.id),
				this.echoRepository.getTokenSymbol(contract.id),
			]);
			contract.token_info = {
				name, symbol, total_supply: totalSupply,
			};
		}
		const dContract = await this.contractRepository.create(contract);
		this.redisConnection.emit(REDIS.EVENT.NEW_CONTRACT, dContract);
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contract: contract.id,
		});
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contract: result,
		});
	}

}
