import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import OperationRepository from 'repositories/operation.repository';
import BlockRepository from 'repositories/block.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

import { TDocument } from 'types/mongoose/tdocument';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_UPDATE;

export default class ProposalUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.PROPOSAL_UPDATE;

	constructor(
		private operationRepository: OperationRepository,
		private blockRepository: BlockRepository,
		private accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const query = {
			id: ECHO.OPERATION_ID.PROPOSAL_CREATE,
			result: body.proposal,
		};
		const createOperation = <TDocument<IOperation<ECHO.OPERATION_ID.PROPOSAL_CREATE>>>
			(await this.operationRepository.findOne(query));
		const signaturesToAdd = [...body.active_approvals_to_add, ...body.key_approvals_to_add];
		const signaturesToRemove = [...body.active_approvals_to_remove, ...body.key_approvals_to_remove];
		let { approvals } = createOperation.body;
		if (!approvals) {
			approvals = signaturesToAdd;
		} else {
			signaturesToAdd.forEach((s) => {
				if (!approvals.includes(s)) {
					approvals.push(s);
				}
			});
			signaturesToRemove.forEach((s) => {
				if (approvals.includes(s)) {
					approvals.splice(approvals.indexOf(s), 1);
				}
			});
		}
		await this.operationRepository.findOneAndUpdate(query, {
			body: {
				...createOperation.body,
				approvals,
			},
		});

		const account = await this.accountRepository.findOne({ 'committee_options.proposal_id': body.proposal });

		if (account) {
			const approvesCount = account.committee_options.approves_count as number || 0;
			const res = approvesCount + body.active_approvals_to_add.length - body.active_approvals_to_remove.length;
			account.committee_options.approves_count = res < 0 ? 0 : res;
			await account.save();
		}

		return this.validateRelation({
			from: [body.fee_paying_account],
			to: [body.proposal],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const createOperation = await this.operationRepository.findOne({
			id: ECHO.OPERATION_ID.PROPOSAL_CREATE,
			result: body.proposal,
		});
		const dBlock = await this.blockRepository.findByMongoId(createOperation.block);
		body.create_operation = `${dBlock.round}-${createOperation.trx_in_block}-${createOperation.op_in_trx}`;
		return <any>body;
	}
}
