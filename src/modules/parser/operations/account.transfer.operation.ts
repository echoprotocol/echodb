import AbstractOperation from './abstract.operation';
import RedisConnection from 'connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import AccountRepository from 'repositories/account.repository';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_TRANSFER;

export default class AccountTransferOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_UPDATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		await this.accountRepository.updateOne(
			{ account: body.account_id },
			{ $set: { account: body.new_owner } },
		);
		this.redisConnection.emit(REDIS.EVENT.ACCOUNT_OWNER_CHANGED, { old: body.account_id, new: body.new_owner });
	}

}
