import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import RavenHelper from '../../../helpers/raven.helper';
import * as ECHO from '../../../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';
import { AssetId } from 'types/echo';

type OP_ID = ECHO.OPERATION_ID.ASSET_GLOBAL_SETTLE;
type Converter = (amount: number | string) => string;

export default class AssetGlobalSettleOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_GLOBAL_SETTLE;

	constructor(
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
		private ravenHelper: RavenHelper,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const { converter, newAssetId } = this.createConverter(body.asset_to_settle, body.settle_price);
		const [dAsset, dNewAsset] = await Promise.all([
			this.assetRepository.findById(body.asset_to_settle),
			this.assetRepository.findById(newAssetId),
		]);
		const dBalances = await this.balanceRepository.findByAsset(dAsset);
		await Promise.all(dBalances.map(async (dBalance) => {
			const amount = dBalance.amount;
			dBalance.amount = '0';
			await Promise.all([
				dBalance.save(),
				this.balanceRepository.updateOrCreateByAccountAndAsset(
					dBalance._account,
					dNewAsset,
					converter(amount),
					{ append: true },
				),
			]);
		}));

		return this.validateRelation({
			from: [body.issuer],
			assets: [
				body.fee.asset_id,
				body.asset_to_settle,
				body.settle_price.base.asset_id,
				body.settle_price.quote.asset_id,
			],
		});
	}

	private createConverter(assetId: AssetId, price: ECHO.IAssetPrice): { converter: Converter, newAssetId: AssetId }  {
		switch (assetId) {
			case price.base.asset_id:
				return {
					newAssetId: price.quote.asset_id,
					converter: (amount: string | number) =>
						new BN(amount).times(price.quote.amount).div(price.base.amount).toString(),
				};
			case price.quote.asset_id:
				return {
					newAssetId: price.base.asset_id,
					converter: (amount: string | number) =>
						new BN(amount).times(price.base.amount).div(price.quote.amount).toString(),
				};
			default:
				throw this.ravenHelper.error(
					new Error('unexpected action'),
					'assetGlobalSettle#createConverter',
					{ assetId, price },
				);
		}
	}

}
