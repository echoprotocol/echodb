import AbstractOperation from './abstract.operation';
import ContractRepository from 'repositories/contract.repository';
import AccountRepository from 'repositories/account.repository';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_UPDATE;

export default class ContractUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_UPDATE;

	constructor(
		private contractRepository: ContractRepository,
		private accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const dContract = await this.contractRepository.findById(body.contract);
		dContract._registrar = await this.accountRepository.findById(body.new_owner);
		dContract.save();
		return this.validateRelation({
			from: [body.sender],
			to: [body.contract],
			accounts: [body.new_owner],
			contracts: [body.contract],
			assets: [body.fee.asset_id],
		});
	}
}
