import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import EchoRepository from '../../../repositories/echo.repository';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT;

export default class SidechainEthDepositOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT;

	constructor(
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(
		body: ECHO.OPERATION_PROPS<OP_ID>,
	) {
		return this.validateRelation({
			from: [body.committee_member_id],
			to: [body.account],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const accountEthAddress = await this.echoRepository.getEthAddress(body.account);
		body.from_address = accountEthAddress.eth_addr;
		return <any>body;
	}
}
