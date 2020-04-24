import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import EchoRepository from '../../../repositories/echo.repository';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_ADDRESS;

export default class SidechainBtcCreateAddressOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_ADDRESS;

	constructor(
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<Y>,
		result: Y extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<Y> : unknown,
	) {
		const { body } = <IOperation<OP_ID>>operation;
		const depositAddress = await this.echoRepository.getObject(<any>result);
		body.received_deposit_address = (<any>depositAddress).deposit_address.address;
		return <any>body;
	}

}
