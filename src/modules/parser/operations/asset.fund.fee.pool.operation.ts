import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';
import { IAssetDocument } from '../../../interfaces/IAsset';
import { IAccountDocument } from '../../../interfaces/IAccount';

type OP_ID = ECHO.OPERATION_ID.ASSET_FUND_FEE_POOL;
export default class AssetFundFeePoolOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_FUND_FEE_POOL;

	constructor(
		readonly assetRepository: AssetRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	// this operation changes account core asset balance and changes asset fee pool
	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAsset, dCoreAsset, [dAccount]] = await Promise.all([
			this.assetRepository.findById(ECHO.CORE_ASSET),
			this.assetRepository.findById(body.asset_id),
			this.echoService.checkAccounts([body.from_account]),
		]);
		await Promise.all([
			this.changeBalance(dAccount, dAsset, body.amount),
			this.changeFeePool(dCoreAsset, body.amount),
		]);
		return this.validateRelation({
			from: [body.from_account],
			assets: [body.fee.asset_id, body.asset_id],
		});
	}

	// balance must exist do perform this operation, so we can be sure it exists
	async changeBalance(dAccount: IAccountDocument, dAsset: IAssetDocument, amount: string | number) {
		const dBalance = await this.balanceRepository.findByAccountAndAsset(dAccount, dAsset);
		dBalance.amount = new BN(dBalance.amount).minus(amount).toString();
		await dBalance.save();
	}

	async changeFeePool(dAsset: IAssetDocument, amount: string | number) {
		console.log('1', dAsset.toObject());
		dAsset.dynamic.fee_pool = new BN(dAsset.dynamic.fee_pool).plus(amount).toString();
		console.log('2', dAsset.toObject());
		await dAsset.save();
	}

}
