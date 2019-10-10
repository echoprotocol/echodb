import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.VESTING_BALANCE_CREATE;

export default class VestingBalanceCreateOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.VESTING_BALANCE_CREATE;

    constructor (
    ) {
        super ();
    }
    async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
        return this.validateRelation({
			from: [body.creator],
			to: [body.owner],
			assets: [body.fee.asset_id],
		});
    }
}