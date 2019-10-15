import AbstractOperation from './abstract.operation';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import BN from 'bignumber.js';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.VESTING_BALANCE_WITHDRAW;

export default class VestingBalanceWithdrawOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.VESTING_BALANCE_WITHDRAW;
	constructor (
		private balanceRepository: BalanceRepository,
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
	) {
		super();
	}
	async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dTo, dAsset] = await Promise.all([
			this.accountRepository.findById(body.owner),
			this.assetRepository.findById(body.amount.asset_id),
		]);
		const amount = new BN(body.amount.amount).toString(10);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dTo,
			dAsset,
			new BN(amount).toString(10),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.vesting_balance],
			to: [body.owner],
			assets: [body.fee.asset_id],
		});
	}
}
