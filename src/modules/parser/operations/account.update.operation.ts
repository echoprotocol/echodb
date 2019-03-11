import AbstractOperation from './abstract.operation';
import RedisConnection from '../../../connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import AccountRepository from '../../../repositories/account.repository';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_UPDATE;

export default class AccountUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_UPDATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const toUpdate: { [x in 'active' | 'owner' | 'ed_key' | 'options']?: unknown } = {};
		if (body.active) toUpdate.active = body.active;
		if (body.owner) toUpdate.owner = body.owner;
		if (body.ed_key) toUpdate.ed_key = body.ed_key;
		if (body.new_options) toUpdate.options = body.new_options;
		await this.accountRepository.updateOne(
			{ account: body.account },
			{ $set: toUpdate },
		);
		this.redisConnection.emit(REDIS.EVENT.ACCOUNT_UPDATED, body.account);
	}

}
