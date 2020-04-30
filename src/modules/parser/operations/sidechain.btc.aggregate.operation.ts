import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import EchoRepository from '../../../repositories/echo.repository';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BTC_AGGREGATE;

export default class SidechainBtcAggregateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BTC_AGGREGATE;

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
		const committeeMember = await this.echoRepository.getCommitteeMemberByAccount(committeeMemberId);
		body.committee_member = committeeMember;
		return <any>body;
	}

}
