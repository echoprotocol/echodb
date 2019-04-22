import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from 'repositories/balance.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.ASSET_SETTLE_CANCEL;
export default class AssetSettleCancelOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_SETTLE_CANCEL;

	constructor(
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
		private echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAsset, [dAccount]] = await Promise.all([
			this.assetRepository.findById(body.amount.asset_id),
			this.echoService.checkAccounts([body.account]),
		]);
		const dBalance = await this.balanceRepository.findByAccountAndAsset(dAccount, dAsset);
		if (dBalance) {
			dBalance.amount = new BN(dBalance.amount).plus(body.amount.amount).toString();
			await dBalance.save();
		} else {
			await this.balanceRepository.createByAccountAndAsset(
				dAccount,
				dAsset,
				body.amount.amount.toString(),
			);
		}
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}
}
