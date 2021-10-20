import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_CONTRACT_OPERATION;

export default class SidechainErc20RegisterContractOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_CONTRACT_OPERATION;

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
