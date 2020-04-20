import AbstractOperation from './abstract.operation';
import AccountRepository from 'repositories/account.repository';
import RedisConnection from 'connections/redis.connection';
import { IOperation } from '../../../interfaces/IOperation';
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
				registrar: body.registrar,
				network_fee_percentage: 2000,
				name: body.name,
				active: body.active,
				echorand_key: body.echorand_key,
				options: body.options,
				statistics: '2.6.12', // FIXME: what sould be placed here?
				whitelisting_accounts: [],
				blacklisting_accounts: [],
				whitelisted_accounts: [],
				blacklisted_accounts: [],
				owner_special_authority: body.owner_special_authority,
				active_special_authority: body.owner_special_authority,
				top_n_control_flags: 0,
				concentration_balance_rate: 0,
				concentration_history_rate: 0,
				addresses: [],
				evm_address: body.evm_address,
			});
		this.redisConnection.emit(REDIS.EVENT.NEW_ACCOUNT, dAccount);
		return this.validateRelation({
			from: [body.registrar],
			to: [result],
			accounts: [result],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<Y>,
		result: Y extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<Y> : unknown,
	) {
		const { body } = <IOperation<OP_ID>>operation;
		body.new_account_id = (<ECHO.OPERATION_RESULT<OP_ID>>result);

		return <any>body;
	}

}
