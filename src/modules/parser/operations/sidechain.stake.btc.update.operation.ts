import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import BalanceRepository from 'repositories/balance.repository';
import { IOperation } from 'interfaces/IOperation';
import AccountRepository from 'repositories/account.repository';
import AssetRepository from 'repositories/asset.repository';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_STAKE_BTC_UPDATE;

export default class SidechainStakeBtcUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_STAKE_BTC_UPDATE;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const account = await this.accountRepository.findById(body.owner);
		const asset = await this.assetRepository.findById(ECHO.SBTC_ASSET);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			account._id,
			asset._id,
			body.btc_tx_info.out.amount.toString(),
			{ append: true },
		);

		return this.validateRelation({
			from: [body.owner],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		body.transaction_hash = body.btc_tx_info.out.tx_id;
		return <any>body;
	}
}
