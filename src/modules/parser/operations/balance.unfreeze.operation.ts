import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.BALANCE_UNFREEZE;

export default class BalanceUnfreezeOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.BALANCE_UNFREEZE;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dAccount, dAsset] = await Promise.all([
			this.accountRepository.findById(body.account),
			this.assetRepository.findById(body.amount.asset_id),
		]);
		const amount = new BN(body.amount.amount).toString();
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dAccount,
			dAsset,
			new BN(amount).toString(),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.account],
			accounts: [body.account],
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}

}
