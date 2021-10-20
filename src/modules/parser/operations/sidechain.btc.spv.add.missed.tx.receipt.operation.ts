import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BTC_SPV_ADD_MISSED_TX_RECEIPT;

export default class SidechainBtcSpvAddMissedTxReceiptOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BTC_SPV_ADD_MISSED_TX_RECEIPT;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.reporter],
			assets: [body.fee.asset_id],
		});
	}
}
