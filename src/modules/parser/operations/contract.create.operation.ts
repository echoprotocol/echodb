import AbstractOperation from './abstract.operation';
import ContractRepository from '../../../repositories/contract.repository';
import * as ECHO from '../../../constants/echo.constants';
import EchoService from '../../../services/echo.service';
import AccountRepository from '../../../repositories/account.repository';
import ContractService from '../../../services/contract.service';
import EchoRepository from '../../../repositories/echo.repository';
import { ethAddrToEchoId } from '../../../utils/format';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CREATE;

export default class ContractCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CREATE;

	constructor(
		readonly accountRepository: AccountRepository,
		readonly contractRepository: ContractRepository,
		readonly contractService: ContractService,
		readonly echoService: EchoService,
		readonly echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID], result: ECHO.OPERATION_RESULT[OP_ID]) {
		const [dAccount] = await this.echoService.checkAccounts([body.registrar]);
		const [, { exec_res: { new_address: hexAddr } }] = await this.echoRepository.getContractResult(result);
		await this.contractRepository.create({
			id: ethAddrToEchoId(hexAddr),
			registrar: dAccount,
			eth_accuracy: body.eth_accuracy,
			supported_asset_id: body.supported_asset_id || null,
			type: this.contractService.getTypeByCode(body.code),
		});
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
			contract: result,
		});
	}

}
