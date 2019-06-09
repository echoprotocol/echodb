import RedisConnection from '../../../connections/redis.connection';
import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_UPDATE;
type UpdateAccount = {
	active?: ECHO.AccountPerson;
	echorand_key?: string;
	options?: ECHO.AccountOptions;
	// FIXME: are fields updateable ?
	owner_special_authority?: ECHO.Authority;
	active_special_authority?: ECHO.Authority;
};

// TODO: look for owner change and emit REDOS.EVENT.ACCOUNT_OWNER_CHANGED
export default class AccountUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_UPDATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const toUpdate: UpdateAccount = {};
		if (body.active) toUpdate.active = body.active;
		if (body.echorand_key) toUpdate.echorand_key = body.echorand_key;
		if (body.new_options) toUpdate.options = body.new_options;
		const dAccount = await this.accountRepository.findOneAndUpdate(
			{ id: body.account },
			{ $set: toUpdate },
			{ new: true },
		);
		this.redisConnection.emit(REDIS.EVENT.ACCOUNT_UPDATED, dAccount);
		// FIXME: add some fields from options ?
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id],
		});
	}

}
