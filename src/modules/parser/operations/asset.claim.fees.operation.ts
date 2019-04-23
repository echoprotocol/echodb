import AbstractOperation from './abstract.operation';
import AccountRepository from 'repositories/account.repository';
import AssetRepository from 'repositories/asset.repository';
import BalanceRepository from 'repositories/balance.repository';
import BN from 'bignumber.js';
import EchoService from 'services/echo.service';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_CLAIM_FEES;

export default class AssetClaimFeesOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_CLAIM_FEES;

	constructor(
		readonly accountRepository: AccountRepository,
		readonly assetRepository: AssetRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	// when you pay fee in a asset, fee amount goes to asset.dynamic.accumulated_fees
	// this operation moves assets from dynamic.accumulated_fees to issuer balance
	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dAsset, dAccount] = await Promise.all([
			this.assetRepository.findById(body.amount_to_claim.asset_id),
			this.accountRepository.findById(body.issuer),
		]);
		dAsset.dynamic.accumulated_fees = new BN(dAsset.dynamic.accumulated_fees)
			.minus(body.amount_to_claim.amount)
			.toString();
		await Promise.all([
			this.balanceRepository.updateOrCreateByAccountAndAsset(
				dAccount, dAsset, body.amount_to_claim.amount.toString(), { append: true },
			),
			dAsset.save(),
		]);
		return this.validateRelation({
			from: [body.issuer],
			assets: [body.fee.asset_id, body.amount_to_claim.asset_id],
		});
	}
}
