import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.BLOCK_REWARD;

export default class BlockRewardOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.BLOCK_REWARD;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const usedAssets: string[] = [];

		const dAccount = await this.accountRepository.findById(body.receiver);

		const balances = body.assets.map(async ({ amount, asset_id }) => {
			usedAssets.push(asset_id);
			const dAsset = await this.assetRepository.findById(asset_id);
			const rewardAmount = new BN(amount).toString();

			await this.balanceRepository.updateOrCreateByAccountAndAsset(
				dAccount,
				dAsset,
				rewardAmount,
				{ append: true },
			);
		});

		await Promise.all(balances);

		return this.validateRelation({
			from: [],
			to: [body.receiver],
			accounts: [body.receiver],
			assets: usedAssets,
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const findAssetPromises = body.assets.map(async(asset) => {
			const dAsset = (await this.assetRepository.findById(asset.asset_id));
			const { options: { core_exchange_rate: assetCoreRate } } = dAsset;
			asset.priceInEcho = new BN(assetCoreRate.base.amount).div(assetCoreRate.quote.amount).toString(10);
			asset.symbol = dAsset.symbol;
		});
		await Promise.all(findAssetPromises);
		return <any>body;
	}
}
