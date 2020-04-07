import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import BalanceRepository from 'repositories/balance.repository';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_FUND_POOL;

export default class ContractFundPoolOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_FUND_POOL;

	constructor(
		private balanceRepository: BalanceRepository,
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dFrom, dAsset] = await Promise.all([
			this.accountRepository.findById(body.sender),
			this.assetRepository.findById(body.value.asset_id),
		]);
		const amount = new BN(body.value.amount).toString();
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dFrom,
			dAsset,
			new BN(amount).negated().toString(),
			{ append: true },
		);
		return this.validateRelation({
			from: [body.sender],
			to: [body.contract],
			assets: [body.fee.asset_id, body.value.asset_id],
			contracts: [body.contract],
		});
	}
}
