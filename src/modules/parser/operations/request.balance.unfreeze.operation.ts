import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.REQUEST_BALANCE_UNFREEZE;

export default class RequestBalanceUnfreezeOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.REQUEST_BALANCE_UNFREEZE;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.account],
			to: [],
			accounts: [body.account],
			assets: [body.fee.asset_id],
		});
	}

}
