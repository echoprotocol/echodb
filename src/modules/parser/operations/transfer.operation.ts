import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import RedisConnection from 'connections/redis.connection';
import EchoService from '../../../services/echo.service';
import AssetRepository from 'repositories/asset.repository';
import TransferRepository from 'repositories/transfer.repository';
import AccountRepository from 'repositories/account.repository';
import BalanceRepository from 'repositories/balance.repository';
import * as BALANCE from '../../../constants/balance.constants';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import { IAsset } from '../../../interfaces/IAsset';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc } from '../../../types/mongoose';

type OP_ID = ECHO.OPERATION_ID.TRANSFER;

export default class TransferOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.TRANSFER;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly assetRepository: AssetRepository,
		readonly transferRepository: TransferRepository,
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [[from, to], dAsset] = await Promise.all([
			this.accountRepository.findManyByIds([body.from, body.to]),
			this.assetRepository.findById(body.amount.asset_id),
		]);
		const amount = new BN(body.amount.amount).toString();
		const dTransfer = await this.transferRepository.create({
			amount,
			_from: from,
			_to: to,
			_asset: dAsset,
			type: BALANCE.TYPE.ASSET,
			memo: body.memo || null,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_TRANSFER, dTransfer);
		await this.transferBalance(from, to, dAsset, amount);
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
