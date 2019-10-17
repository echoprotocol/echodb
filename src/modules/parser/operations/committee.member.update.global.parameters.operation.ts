import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS;

export default class CommitteeMemberUpdateGlobalParametersOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS;
	constructor (
	) {
		super();
	}
	async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [],
			assets: [body.fee.asset_id],
		});
	}
}
