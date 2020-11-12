import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import BalanceRepository from 'repositories/balance.repository';
import AccountRepository from 'repositories/account.repository';
import AssetRepository from 'repositories/asset.repository';
type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_STAKE_ETH_UPDATE;

export default class SidechainStakeEthUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_STAKE_ETH_UPDATE;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const account = await this.accountRepository.findById(body.account);
		const asset = await this.assetRepository.findById(ECHO.SETH_ASSET);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			account._id,
			asset._id,
			body.current_balance.toString(),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id, body.asset_id],
		});
	}
}
