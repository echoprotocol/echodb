import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_STAKE_SCRIPT;

export default class SidechainBtcCreateStakeScriptOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_STAKE_SCRIPT;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id],
		});
	}
}
