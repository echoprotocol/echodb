import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from '../../../repositories/balance.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';
import { IAsset } from '../../../interfaces/IAsset';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc } from '../../../types/mongoose';

type OP_ID = ECHO.OPERATION_ID.ASSET_FUND_FEE_POOL;
export default class AssetFundFeePoolOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_FUND_FEE_POOL;

	constructor(
		readonly accountRepository: AccountRepository,
		readonly assetRepository: AssetRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	// this operation changes account core asset balance and changes asset fee pool
	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAsset, dCoreAsset, dAccount] = await Promise.all([
			this.assetRepository.findById(body.asset_id),
			this.assetRepository.findById(ECHO.CORE_ASSET),
			this.accountRepository.findById(body.from_account),
		]);
		await Promise.all([
			this.changeBalance(dAccount, dCoreAsset, body.amount),
			this.changeFeePool(dAsset, body.amount),
		]);
		return this.validateRelation({
			from: [body.from_account],
			assets: [body.fee.asset_id, body.asset_id],
		});
	}

	async changeBalance(dAccount: TDoc<IAccount>, dAsset: TDoc<IAsset>, amount: string | number) {
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dAccount,
			dAsset,
			new BN(amount).negated().toString(),
			{ append: true },
		);
	}

	async changeFeePool(dAsset: TDoc<IAsset>, amount: string | number) {
		dAsset.dynamic.fee_pool = new BN(dAsset.dynamic.fee_pool).plus(amount).toString();
		await dAsset.save();
	}

}
