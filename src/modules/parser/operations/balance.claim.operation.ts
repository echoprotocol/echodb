import AbstractOperation from './abstract.operation';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import BN from 'bignumber.js';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.BALANCE_CLAIM;

export default class BalanceClaimOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.BALANCE_CLAIM;
	constructor(
		private balanceRepository: BalanceRepository,
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
	) {
		super();
	}
	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dTo, dAsset] = await Promise.all([
			this.accountRepository.findById(body.deposit_to_account),
			this.assetRepository.findById(body.total_claimed.asset_id),
		]);
		const amount = new BN(body.total_claimed.amount).toString(10);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dTo,
			dAsset,
			new BN(amount).toString(10),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.deposit_to_account],
			to: [body.total_claimed.asset_id],
			assets: [body.fee.asset_id, body.total_claimed.asset_id],
		});
	}
}
