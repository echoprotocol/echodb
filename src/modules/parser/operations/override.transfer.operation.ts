import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import { IAsset } from '../../../interfaces/IAsset';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc } from '../../../types/mongoose';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.OVERRIDE_TRANSFER;

export default class OverrideTransferOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.OVERRIDE_TRANSFER;

    constructor (
        private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
    ) {
        super ();
    }
    async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
        const [[dFrom, dTo], dAsset] = await Promise.all([
			this.accountRepository.findManyByIds([body.from, body.to]),
			this.assetRepository.findById(body.amount.asset_id),
		]);
		const amount = new BN(body.amount.amount).toString(10);
		await this.transferBalance(dFrom, dTo, dAsset, amount);
        return this.validateRelation({
			from: [body.from],
			to: [body.to],
			assets: [body.fee.asset_id],
		});
    }
    async transferBalance(from: TDoc<IAccount>, to: TDoc<IAccount>, dAsset: TDoc<IAsset>, amount: string) {
		await Promise.all([
			this.balanceRepository.updateOrCreateByAccountAndAsset(
				from,
				dAsset,
				new BN(amount).negated().toString(10),
				{ append: true },
			),
			this.balanceRepository.updateOrCreateByAccountAndAsset(
				to,
				dAsset,
				new BN(amount).toString(10),
				{ append: true },
			),
		]);
	}
}