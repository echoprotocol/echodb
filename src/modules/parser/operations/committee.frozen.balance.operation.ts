import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.COMMITTEE_FROZEN_BALANCE_DEPOSIT;

export default class CommitteeFrozenBalanceOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.COMMITTEE_FROZEN_BALANCE_DEPOSIT;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.committee_member_account],
			assets: [body.fee.asset_id],
		});
	}
}
