import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import EchoService from '../../../services/echo.service';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_UPGRADE;
export default class AccountUpgradeOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_UPGRADE;

	constructor(
		private echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAccount] = await this.echoService.checkAccounts([body.account_to_upgrade]);
		dAccount.registrar = body.account_to_upgrade;
		dAccount.referrer = body.account_to_upgrade;
		dAccount.lifetime_referrer = body.account_to_upgrade;
		dAccount.membership_expiration_date = '2106-02-07T06:28:15';
		dAccount.lifetime_referrer_fee_percentage = 8000;
		await dAccount.save();
		return this.validateRelation({
			from: [body.account_to_upgrade],
			assets: [body.fee.asset_id],
		});
	}

}
