import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import EchoRepository from '../../../repositories/echo.repository';
import { IBlock } from '../../../interfaces/IBlock';
import { TDoc } from '../../../types/mongoose';
import * as COMMITTEE from '../../../constants/committee.constants';

import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.COMMITTEE_MEMBER_CREATE;

export default class CommitteeMemberCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.COMMITTEE_MEMBER_CREATE;

	constructor(
		private accountRepository: AccountRepository,
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, _: any , dBlock: TDoc<IBlock>) {
		const { committee_member_account: id, eth_address, btc_public_key } = body;
		const committeeObject = await this.echoRepository.getCommitteeMemberByAccount(id);
		const committee_member_id = committeeObject ? committeeObject.id : '';
		const committee_options = {
			eth_address,
			btc_public_key,
			committee_member_id,
			status: COMMITTEE.STATUS.CANDIDATE,
			proposal_operation: '',
			approves_count: 0,
			last_status_change_time: dBlock.timestamp,
		};

		await this.accountRepository.findOneAndUpdate({ id }, { committee_options });

		return this.validateRelation({
			from: [body.committee_member_account],
			assets: [body.fee.asset_id],
		});
	}
}
