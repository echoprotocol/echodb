import AbstractOperation from './abstract.operation';
import AccountRepository from 'repositories/account.repository';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.EVM_ADDRESS_REGISTER;

export default class EVMAddressRegister extends AbstractOperation<OP_ID>{
	id = ECHO.OPERATION_ID.EVM_ADDRESS_REGISTER;

	constructor(
		readonly accountRepository: AccountRepository,
	) {
		super();
	}
	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const { evm_address, owner } = body;
		const account = await this.accountRepository.findById(owner);
		account.evm_address = evm_address;
		await account.save();

		return this.validateRelation({
			from: [body.owner],
			assets: [body.fee.asset_id],
		});
	}

}
