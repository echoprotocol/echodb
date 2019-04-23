import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from 'repositories/balance.repository';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_SETTLE_CANCEL;
export default class AssetSettleCancelOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_SETTLE_CANCEL;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dAsset, dAccount] = await Promise.all([
			this.assetRepository.findById(body.amount.asset_id),
			this.accountRepository.findById(body.account),
		]);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dAccount,
			dAsset,
			body.amount.amount.toString(),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}
}
