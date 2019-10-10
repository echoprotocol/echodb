import AbstractOperation from './abstract.operation';
// import AssetRepository from 'repositories/asset.repository';
// import BalanceRepository from 'repositories/balance.repository';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.BALANCE_CLAIM;

export default class BalanceClaimOperation extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.BALANCE_CLAIM;

    constructor (
        // private balanceRepository: BalanceRepository,
        // private assetRepository: AssetRepository,
    ) {
        super ();
    }
    async parse (body: ECHO.OPERATION_PROPS<OP_ID>) {
        // const dAsset = await this.assetRepository.findById(body.total_claimed.asset_id)
        // const balance = await this.balanceRepository.findByAsset(dAsset);
        return this.validateRelation({
			from: [body.deposit_to_account],
			assets: [body.fee.asset_id],
		});
    }
}