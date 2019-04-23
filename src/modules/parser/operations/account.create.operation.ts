import AbstractOperation from './abstract.operation';
import AccountRepository from 'repositories/account.repository';
import RedisConnection from 'connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_CREATE;

export default class AccountCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_CREATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>, result: ECHO.OPERATION_RESULT<OP_ID>) {
		const dAccount = await this.accountRepository.findById(result)
			|| await this.accountRepository.create({
				id: result,
				// TODO: set real expire date
				membership_expiration_date: new Date().toISOString(),
				registrar: body.registrar,
				referrer: body.referrer,
				lifetime_referrer: body.referrer,
				network_fee_percentage: 2000,
				lifetime_referrer_fee_percentage: 3000,
				referrer_rewards_percentage: body.referrer_percent,
				name: body.name,
				owner: body.owner,
				active: body.active,
				ed_key: body.ed_key,
				options: body.options,
				statistics: '2.6.12', // FIXME: what sould be placed here?
				whitelisting_accounts: [],
				blacklisting_accounts: [],
				whitelisted_accounts: [],
				blacklisted_accounts: [],
				owner_special_authority: body.owner_special_authority,
				active_special_authority: body.owner_special_authority,
				top_n_control_flags: 0,
			});
		this.redisConnection.emit(REDIS.EVENT.NEW_ACCOUNT, dAccount);
		return this.validateRelation({
			from: [body.registrar],
			accounts: [result, body.registrar, body.referrer],
			assets: [body.fee.asset_id],
		});
	}

}
