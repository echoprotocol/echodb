import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import BlockRepository from 'repositories/block.repository';
import OperationRepository from 'repositories/operation.repository';
import { TDocument } from 'types/mongoose/tdocument';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_DELETE;

export default class ProposalDeleteOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.PROPOSAL_DELETE;

	constructor(
		private operationRepository: OperationRepository,
		private blockRepository: BlockRepository,
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
		await this.operationRepository.findOneAndUpdate(query, {
			body: {
				...createOperation.body,
				have_delete_operation: true,
			},
		});
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
