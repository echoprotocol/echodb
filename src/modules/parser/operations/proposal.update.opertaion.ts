import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.PROPOSAL_UPDATE;

export default class ProposalUpdater extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.PROPOSAL_UPDATE;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.fee_paying_account],
			assets: [body.fee.asset_id],
		});
	}

}