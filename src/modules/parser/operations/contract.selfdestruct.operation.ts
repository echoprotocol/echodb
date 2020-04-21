import AbstractOperation from './abstract.operation';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import BN from 'bignumber.js';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_SELFDESTRUCT;

export default class ContractSelfdestructOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_SELFDESTRUCT;

	constructor(
		private balanceRepository: BalanceRepository,
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
	) { super(); }

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const dTo = await this.accountRepository.findById(body.recipient);
		await Promise.all(body.amounts.map(async ({ asset_id, amount }) => {
			const dAsset = await this.assetRepository.findById(asset_id);
			await this.balanceRepository.updateOrCreateByAccountAndAsset(
				dTo,
				dAsset,
				new BN(amount).toString(10),
				{ append: true },
			);
		}));
		return this.validateRelation({
			from: [body.contract],
			to: [body.recipient],
			assets: body.amounts.map((value) => value.asset_id),
		});
	}
}
