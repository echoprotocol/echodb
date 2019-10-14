import AbstractOperation from './abstract.operation';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import BN from 'bignumber.js';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.VESTING_BALANCE_CREATE;

export default class VestingBalanceCreateOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.VESTING_BALANCE_CREATE;

    constructor (
        private balanceRepository: BalanceRepository,
        private assetRepository: AssetRepository,
        private accountRepository: AccountRepository,
    ) {
        super ();
    }
    async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
        const [dFrom, dAsset] = await Promise.all([
			this.accountRepository.findById(body.creator),
			this.assetRepository.findById(body.amount.asset_id),
		]);
        const amount = new BN(body.amount.amount).toString();
        await this.balanceRepository.updateOrCreateByAccountAndAsset(
            dFrom,
            dAsset,
            new BN(amount).negated().toString(),
			{ append: true },
        )

        return this.validateRelation({
            from: [body.creator],
            to: [body.owner],
			assets: [body.fee.asset_id],
		});
    }
}