import AbstractOperation from './abstract.operation';
import ContractRepository from '../../../repositories/contract.repository';
import * as ECHO from '../../../constants/echo.constants';
import * as CONTRACT from '../../../constants/contract.constants';
import EchoService from 'services/echo.service';
import AccountRepository from 'repositories/account.repository';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_CREATE;

export default class ContractCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_CREATE;

	constructor(
		readonly contractRepository: ContractRepository,
		readonly echoService: EchoService,
		readonly accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID], result: ECHO.OPERATION_RESULT[OP_ID]) {
		await this.echoService.checkAccounts([body.registrar]);
		await this.contractRepository.create({
			id: result,
			type: this.getContractType(body.code),
			...body,
			supported_asset_id: body.supported_asset_id || null,
		});
	}

	getContractType(bytecode: string): CONTRACT.TYPE {
		if (this.isERC20(bytecode)) return CONTRACT.TYPE.ERC20;
		return CONTRACT.TYPE.COMMON;
	}

	// FIXME: is it ok?
	isERC20(bytecode: string): boolean {
		for (const hash of CONTRACT.ERC20_METHOD_HASHES) {
			if (!bytecode.includes(hash)) return false;
		}
		return true;
	}

}
