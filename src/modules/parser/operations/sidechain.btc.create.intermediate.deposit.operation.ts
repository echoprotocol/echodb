import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import EchoRepository from '../../../repositories/echo.repository';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT;

export default class SidechainBtcCreateIntermediateDepositOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT;

	constructor(
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.committee_member_id],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const committeeMemberId = body.committee_member_id;
		const addressId = body.btc_address_id;
		const committeeMember = await this.echoRepository.getCommitteeMemberByAccount(committeeMemberId);
		const depositAddress = await this.echoRepository.getObject(addressId);
		body.committee_member = committeeMember;
		body.deposit_address = (<any>depositAddress).deposit_address.address;
		body.transaction_hash = body.tx_info.out.tx_id;
		return <any>body;
	}

}
