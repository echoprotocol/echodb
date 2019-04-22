import AbstractOperation from './abstract.operation';
import RedisConnection from 'connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import AccountRepository from 'repositories/account.repository';
import EchoService from '../../../services/echo.service';
import { addToArray, removeFromArray } from '../../../utils/common';

type OP_ID = ECHO.OPERATION_ID.ACCOUNT_WHITELIST;

export default class AccountWhitelistOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ACCOUNT_WHITELIST;

	constructor(
		private redisConnection: RedisConnection,
		readonly accountRepository: AccountRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAccount] = await this.echoService.checkAccounts([body.authorizing_account]);
		switch (body.new_listing) {
			case ECHO.ACCOUNT_WHITELIST.BLACK_LISTED: {
				// add to list if not listed
				// delete from white list
				addToArray(dAccount.blacklisted_accounts, body.account_to_list);
				removeFromArray(dAccount.whitelisted_accounts, body.account_to_list);
			}
			case ECHO.ACCOUNT_WHITELIST.WHITE_LISTED: {
				// add to w list if not listed
				// delete from black list
				addToArray(dAccount.whitelisted_accounts, body.account_to_list);
				removeFromArray(dAccount.blacklisted_accounts, body.account_to_list);
			}
			case ECHO.ACCOUNT_WHITELIST.WHITE_AND_BLACK_LISTED: {
				// add to w and b lists if not listed
				addToArray(dAccount.blacklisted_accounts, body.account_to_list);
				addToArray(dAccount.whitelisted_accounts, body.account_to_list);
			}
			case ECHO.ACCOUNT_WHITELIST.NO_LISTING: {
				// delete from black list
				// delete from white list
				removeFromArray(dAccount.whitelisted_accounts, body.account_to_list);
				removeFromArray(dAccount.blacklisted_accounts, body.account_to_list);
			}
		}
		await dAccount.save();
		this.redisConnection.emit(REDIS.EVENT.ACCOUNT_UPDATED, body.authorizing_account);
		return this.validateRelation({
			from: [body.authorizing_account],
			assets: [body.fee.asset_id],
			accounts: [body.account_to_list],
		});
	}

}
