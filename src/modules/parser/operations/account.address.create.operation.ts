import AccountRepository from 'repositories/account.repository';
import EchoRepository from 'repositories/echo.repository';
import AbstractOperation from './abstract.operation';
import { addToArray } from '../../../utils/common';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from '../../../interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_ADDRESS_CREATE;

export default class AccountAddressCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_ADDRESS_CREATE;

	constructor(
		readonly accountRepository: AccountRepository,
		readonly echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, result: ECHO.OPERATION_RESULT<OP_ID>) {
		const dAccount = await this.accountRepository.findById(body.owner);
		const addressAccount = await this.echoRepository.getAddressObject(result);

		addToArray(dAccount.addresses, addressAccount);
		await dAccount.save();

		return this.validateRelation({
			from: [body.owner],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<Y>,
		result: Y extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<Y> : unknown,
	) {
		const { body } = <IOperation<OP_ID>>operation;

		body.address = (<ECHO.OPERATION_RESULT<OP_ID>>result);

		return <any>body;
	}
}
