import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN;

export default class SidechainErc20WithdrawTokenOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN;

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
