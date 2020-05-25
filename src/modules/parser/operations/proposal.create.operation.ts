import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import { IBlock } from '../../../interfaces/IBlock';
import { TDoc } from '../../../types/mongoose';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_CREATE;

export default class ProposalCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.PROPOSAL_CREATE;

	constructor(
		private accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(
		body: ECHO.OPERATION_PROPS<OP_ID>,
		result: ECHO.OPERATION_RESULT<OP_ID>,
		dBlock: TDoc<IBlock>,
		opIndex: Number,
		txIndex: Number,
	) {
		const committeeActionOperations = body.proposed_ops
			.filter(([opId]: any[]) => [
				ECHO.OPERATION_ID.COMMITTEE_MEMBER_ACTIVATE,
				ECHO.OPERATION_ID.COMMITTEE_MEMBER_DEACTIVATE,
			].includes(opId))
			.reduce(async (res: unknown[], [, op]: any[]) => {
				const target = op.committee_to_activate || op.committee_to_deactivate;

				if (!target) {
					return res;
				}

				const account = await this.accountRepository
					.findOne({ 'committee_options.committee_member_id': target });

				if (!account) {
					return res;
				}

				const committeeOptions = account.committee_options || {};

				committeeOptions.proposal_operation = `${dBlock.round}-${txIndex}-${opIndex}`;
				committeeOptions.proposal_id = result;
				committeeOptions.approves_count = 0;

				account.committee_options = committeeOptions;
				return [...res, account.save()];
			}, []) as unknown[];

		await Promise.all(committeeActionOperations);
		return this.validateRelation({
			from: [body.fee_paying_account],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		if (!body.review_period_seconds) {
			body.review_period_seconds = 0;
		}
		return <any>body;
	}
}
