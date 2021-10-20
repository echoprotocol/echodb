import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_UPDATE_CONTRACT_ADDRESS;

export default class SidechainEthUpdateContractAddressOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ETH_UPDATE_CONTRACT_ADDRESS;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [ECHO.COMMITTEE_GLOBAL_ACCOUNT],
			assets: [body.fee.asset_id],
		});
	}
}
