import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import EchoRepository from '../../../repositories/echo.repository';
import { IBlock } from '../../../interfaces/IBlock';
import { TDoc } from '../../../types/mongoose';
import * as COMMITTEE from '../../../constants/committee.constants';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.COMMITTEE_MEMBER_DEACTIVATE;

export default class CommitteeMemberDeactivateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.COMMITTEE_MEMBER_DEACTIVATE;

	constructor(
		private accountRepository: AccountRepository,
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, _: any , dBlock: TDoc<IBlock>) {
		const { committee_to_deactivate: committeeMemberId } = body;

		let account = await this.accountRepository
			.findOne({ 'committee_options.committee_member_id': committeeMemberId });

		if (account) {
			const committeeOptions = account.committee_options || {};
			const newCommitteeOptions = {
				...committeeOptions,
				status: COMMITTEE.STATUS.DEACTIVATED,
				last_status_change_time: dBlock.timestamp,
			};

			account.committee_options = newCommitteeOptions;
			await account.save();
		} else {
			const committeeObjects = await this.echoRepository.getCommitteeMembers([committeeMemberId]);
			const committeeObject = committeeObjects && committeeObjects.length && committeeObjects[0];
			if (!committeeObject) {
				return this.validateRelation({
					from: [body.committee_to_deactivate],
					assets: [body.fee.asset_id],
				});
			}

			const { committee_member_account: id, eth_address, btc_public_key } = committeeObject;
			account = await this.accountRepository.findOne({ id });

			if (!account) {
				return this.validateRelation({
					from: [body.committee_to_deactivate],
					assets: [body.fee.asset_id],
				});
			}

			const committeeOptions = {
				eth_address,
				btc_public_key,
				committee_member_id: committeeMemberId,
				status: COMMITTEE.STATUS.DEACTIVATED,
				proposal_operation: '',
				last_status_change_time: dBlock.timestamp,
			};

			account.committee_options = committeeOptions;
			await account.save();
		}

		return this.validateRelation({
			from: [body.committee_to_deactivate],
			assets: [body.fee.asset_id],
		});
	}
}
