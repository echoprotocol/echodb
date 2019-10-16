import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_WHITELIST;

export default class ContractWhitelistOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_WHITELIST;

	constructor() {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const { add_to_whitelist, remove_from_whitelist, add_to_blacklist } = body;
		return this.validateRelation({
			from: [body.sender],
			accounts: [...add_to_whitelist, ...remove_from_whitelist, ...add_to_blacklist],
			assets: [body.fee.asset_id],
		});
	}
}
