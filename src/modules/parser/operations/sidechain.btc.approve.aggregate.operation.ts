import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import EchoRepository from '../../../repositories/echo.repository';
import { IOperation } from 'interfaces/IOperation';
import BlockRepository from 'repositories/block.repository';
import OperationRepository from 'repositories/operation.repository';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE;

export default class SidechainBtcApproveAggregateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE;

	constructor(
		private echoRepository: EchoRepository,
		private blockRepository: BlockRepository,
		private operationRepository: OperationRepository,
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

		const relatedOperation = (await this.operationRepository.find({
			id: ECHO.OPERATION_ID.SIDECHAIN_BTC_AGGREGATE,
			'body.transaction_id': body.transaction_id,
		}))[0];
		const block = await this.blockRepository.findByMongoId(relatedOperation.block);
		body.aggregate_request_operation =
			`${block.round}-${relatedOperation.trx_in_block}-${relatedOperation.op_in_trx}`;
		return <any>body;
	}

}
