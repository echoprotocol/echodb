import AbstractOperation from './abstract.operation';
import AssetRepository from 'repositories/asset.repository';
import BN from 'bignumber.js';
import ContractRepository from 'repositories/contract.repository';
import TransferRepository from 'repositories/transfer.repository';
import TransferService from '../../../services/transfer.service';
import * as BALANCE from '../../../constants/balance.constants';
import * as ECHO from '../../../constants/echo.constants';
import { IAsset } from '../../../interfaces/IAsset';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc } from '../../../types/mongoose';
import { IContract } from 'interfaces/IContract';

type OP_ID = ECHO.OPERATION_ID.CONTRACT_TRANSFER;

export default class ContractTransferOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.CONTRACT_TRANSFER;

	constructor(
		private assetRepository: AssetRepository,
		private transferRepository: TransferRepository,
		private contractRepository: ContractRepository,
		private transferService: TransferService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dFrom, dTo, dAsset] = await Promise.all([
			this.contractRepository.findById(body.from),
			this.transferService.fetchParticipant(body.to),
			this.assetRepository.findById(body.amount.asset_id),
		]);
		const amount = new BN(body.amount.amount).toString();
		await this.transferRepository.createAndEmit({
			amount,
			_asset: dAsset,
			valueType: BALANCE.TYPE.ASSET,
			relationType: this.transferRepository.determineRelationType(body.from, body.to),
		}, dFrom, dTo);

		await this.transferBalance(dFrom, dTo, dAsset, amount);
		return this.validateRelation({
			from: [body.from],
			to: body.to,
			assets: [body.fee.asset_id, body.amount.asset_id],
		});
	}

	async transferBalance(
		dFrom: TDoc<IAccount | IContract>, dTo: TDoc<IAccount | IContract>, dAsset: TDoc<IAsset>, amount: string,
	) {
		const bnAmount = new BN(amount);
		await Promise.all([
			this.transferService.updateOrCreateAsset(
				this.transferRepository.determineParticipantType(dFrom.id),
				dFrom,
				dAsset,
				bnAmount.negated().toString(),
			),
			this.transferService.updateOrCreateAsset(
				this.transferRepository.determineParticipantType(dTo.id),
				dTo,
				dAsset,
				bnAmount.toString(),
			),
		]);
	}
}
