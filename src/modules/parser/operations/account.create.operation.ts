import AbstractOperation from './abstract.operation';
import RedisConnection from 'connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import EchoService from '../../../services/echo.service';
import AccountRepository from 'repositories/account.repository';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_CREATE;

export default class AccountCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_CREATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly accountRepository: AccountRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID], result: ECHO.OPERATION_RESULT[OP_ID]) {
		await this.echoService.checkAccounts([body.registrar, body.referrer]);
		await this.accountRepository.create({ account: result, ...body });
	}

}
