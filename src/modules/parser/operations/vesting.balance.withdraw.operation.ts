import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.VESTING_BALANCE_WITHDRAW;

export default class VestingBalanceWithdrawOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.VESTING_BALANCE_WITHDRAW;

    constructor (
    ) {
        super ();
    }
    async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
        return this.validateRelation({
			from: [body.owner],
			assets: [body.fee.asset_id],
		});
    }
}