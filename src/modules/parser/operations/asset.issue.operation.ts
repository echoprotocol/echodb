import AbstractOperation from './abstract.operation';
import AccountRepository from '../../../repositories/account.repository';
import AssetRepository from '../../../repositories/asset.repository';
import BalanceRepository from 'repositories/balance.repository';
import EchoService from '../../../services/echo.service';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_ISSUE;
export default class AssetIssueOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_ISSUE;

	constructor(
		readonly accountRepository: AccountRepository,
		readonly assetRepository: AssetRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const [dAsset, dIssueTo] = await Promise.all([
			this.assetRepository.findById(body.asset_to_issue.asset_id),
			this.accountRepository.findById(body.issue_to_account),
		]);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dIssueTo, dAsset,
			body.asset_to_issue.amount.toString(),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.issuer],
			assets: [body.fee.asset_id, body.asset_to_issue.asset_id],
			accounts: [body.issue_to_account],
		});
	}
}
