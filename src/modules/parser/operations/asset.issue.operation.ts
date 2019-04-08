import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from 'repositories/balance.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.ASSET_ISSUE;
export default class AssetIssueOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_ISSUE;

	constructor(
		readonly assetRepository: AssetRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAsset, [dIssueTo]] = await Promise.all([
			this.assetRepository.findById(body.asset_to_issue.asset_id),
			this.echoService.checkAccounts([body.issue_to_account, body.issuer]),
		]);
		const dBalance = await this.balanceRepository.findByAccountAndAsset(dIssueTo, dAsset);
		if (dBalance) {
			dBalance.amount = new BN(dBalance.amount).plus(body.asset_to_issue.amount).toString();
			await dBalance.save();
		} else {
			await this.balanceRepository.createByAccountAndAsset(
				dIssueTo,
				dAsset,
				body.asset_to_issue.amount.toString(),
			);
		}
		return this.validateRelation({
			from: [body.issuer],
			assets: [body.fee.asset_id, body.asset_to_issue.asset_id],
			accounts: [body.issue_to_account],
		});
	}
}
