import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import BN from 'bignumber.js';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_SETTLE;
export default class AssetSettleOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_SETTLE;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		// FIXME: do checkAccounts at the very begging, await at the end
		const [dAsset, dAccount] = await Promise.all([
			this.assetRepository.findById(body.amount.asset_id),
			this.accountRepository.findById(body.account),
		]);
		const dBalance = await this.balanceRepository.findByAccountAndAsset(dAccount, dAsset);
		dBalance.amount = new BN(dBalance.amount).minus(body.amount.amount).toString();
		dAsset.dynamic.current_supply = new BN(dAsset.dynamic.current_supply)
			.minus(body.amount.amount).toString();
		await Promise.all([dBalance.save(), dAsset.save()]);
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}
}
