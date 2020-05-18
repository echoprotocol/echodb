import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.DID_CREATE;

export default class DidCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.DID_CREATE;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.registrar],
			assets: [body.fee.asset_id],
		});
	}
}
