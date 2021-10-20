import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_SPV_ADD_MISSED_TX_RECEIPT;

export default class SidechainEthSpvAddMissedTxReceiptOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ETH_SPV_ADD_MISSED_TX_RECEIPT;

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
