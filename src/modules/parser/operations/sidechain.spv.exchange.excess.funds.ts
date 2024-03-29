import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_SPV_EXCHANGE_EXCESS_FUNDS;

export default class SidechainSpvExchangeExcessFunds extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_SPV_EXCHANGE_EXCESS_FUNDS;

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
