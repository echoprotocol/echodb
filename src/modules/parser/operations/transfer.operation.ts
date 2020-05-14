import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import AssetRepository from 'repositories/asset.repository';
import TransferRepository from 'repositories/transfer.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import * as BALANCE from '../../../constants/balance.constants';
import * as ECHO from '../../../constants/echo.constants';
import { IAsset } from '../../../interfaces/IAsset';
import { IAccount } from '../../../interfaces/IAccount';
import { IBlock } from '../../../interfaces/IBlock';
import { TDoc } from '../../../types/mongoose';
import { dateFromUtcIso } from '../../../utils/format';

type OP_ID = ECHO.OPERATION_ID.TRANSFER;

export default class TransferOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.TRANSFER;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private balanceRepository: BalanceRepository,
		private transferRepository: TransferRepository,
	) {
		super();
	}

	async parse(
		body: ECHO.OPERATION_PROPS<OP_ID>,
		_: any, dBlock:
		TDoc<IBlock>,
		trxInBlock: number,
		opInTrx: number,
		virtual: boolean,
	) {
		const [[dFrom, dTo], dAsset] = await Promise.all([
			this.accountRepository.findManyByIds([body.from, body.to]),
			this.assetRepository.findById(body.amount.asset_id),
		]);
		const amount = new BN(body.amount.amount).toString();
		await Promise.all([
			this.transferBalance(dFrom, dTo, dAsset, amount),
			this.transferRepository.createAndEmit({
				amount,
				virtual,
				relationType: await this.transferRepository.determineRelationType(dFrom.id, dTo.id),
				_fromAccount: dFrom,
				_toAccount: dTo,
				_asset: dAsset,
				valueType: BALANCE.TYPE.ASSET,
				timestamp: dateFromUtcIso(dBlock.timestamp),
				block: dBlock.round,
				trx_in_block: trxInBlock,
				op_in_trx: opInTrx,
			}),
		]);
		return this.validateRelation({
			from: [body.from],
			to: body.to,
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}

	async transferBalance(from: TDoc<IAccount>, to: TDoc<IAccount>, dAsset: TDoc<IAsset>, amount: string) {
		await Promise.all([
			this.balanceRepository.updateOrCreateByAccountAndAsset(
				from,
				dAsset,
				new BN(amount).negated().toString(),
				{ append: true },
			),
			this.balanceRepository.updateOrCreateByAccountAndAsset(
				to,
				dAsset,
				new BN(amount).toString(),
				{ append: true },
			),
		]);
	}

}
