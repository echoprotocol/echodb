import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_CREATE;

export default class ProposalCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.PROPOSAL_CREATE;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
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
