import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';
import BN from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.ASSET_SETTLE;
export default class AssetSettleOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_SETTLE;

	constructor(
		private assetRepository: AssetRepository,
		private echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		// FIXME: do checkAccounts at the very begging, await at the end
		const [dAsset] = await Promise.all([
			this.assetRepository.findById(body.amount.asset_id),
			this.echoService.checkAccounts([body.account]),
		]);
		dAsset.dynamic.current_supply = new BN(dAsset.dynamic.current_supply)
			.minus(body.amount.amount).toString();
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}
}
