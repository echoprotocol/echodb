import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.COMMITTEE_MEMBER_ACTIVATE;

export default class CommitteeMemberActivateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.COMMITTEE_MEMBER_ACTIVATE;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.committee_to_activate],
			assets: [body.fee.asset_id],
		});
	}
}
