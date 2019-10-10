import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.OVERRIDE_TRANSFER;

export default class OverrideTransferOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.OVERRIDE_TRANSFER;

    constructor (
    ) {
        super ();
    }
    async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
        return this.validateRelation({
			from: [body.from],
			to: [body.to],
			assets: [body.fee.asset_id],
		});
    }
}