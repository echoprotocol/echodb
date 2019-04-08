import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from 'repositories/balance.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.ASSET_RESERVE;
export default class AssetReserveOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_RESERVE;

	constructor(
		readonly assetRepository: AssetRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAsset, [dAccount]] = await Promise.all([
			this.assetRepository.findById(body.amount_to_reserve.asset_id),
			this.echoService.checkAccounts([body.payer]),
		]);
		const dBalance = await this.balanceRepository.findByAccountAndAsset(dAccount, dAsset);
		dBalance.amount = new BN(dBalance.amount).minus(body.amount_to_reserve.amount).toString();
		await dBalance.save();
		return this.validateRelation({
			from: [body.payer],
			assets: [body.fee.asset_id, body.amount_to_reserve.asset_id],
		});
	}
}
