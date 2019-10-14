import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { IAccount } from '../../../interfaces/IAccount';

type OP_ID = ECHO.OPERATION_ID.BLOCK_REWARD_OPERATION;

export default class BlockRewardOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.BLOCK_REWARD_OPERATION;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const accountIds = Object.keys(body.rewards);
		const [dAccounts, dAsset] = await Promise.all([
			this.accountRepository.findManyByIds(accountIds),
			this.assetRepository.findById(ECHO.CORE_ASSET),
		]);
		dAccounts.map((dAccount: TDoc<IAccount>) => {
			const amount = new BN(body.rewards[dAccount.id]).toString();

			return this.balanceRepository.updateOrCreateByAccountAndAsset(
				dAccount,
				dAsset,
				amount,
				{ append: true },
			);
		});
		return this.validateRelation({
			from: accountIds,
			accounts: accountIds,
			assets: [body.fee.asset_id],
		});
	}

}
