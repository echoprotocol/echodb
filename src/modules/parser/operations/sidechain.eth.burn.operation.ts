import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import BalanceRepository from 'repositories/balance.repository';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BlockRepository from '../../../repositories/block.repository';
import OperationRepository from '../../../repositories/operation.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_BURN;

export default class SidechainEthBurnOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_BURN;

	constructor(
		private balanceRepository: BalanceRepository,
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
		private blockRepository: BlockRepository,
		private operationRepository: OperationRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const [dFrom, dAsset] = await Promise.all([
			this.accountRepository.findById(body.account),
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
			from: [body.account],
			assets: [body.fee.asset_id, body.value.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const withdrawOperation =  await this.operationRepository.findOne({
			'body.withdraw_id': body.withdraw_id,
			$or: [{ id: ECHO.OPERATION_ID.SIDECHAIN_ETH_WITHDRAW }, { id: ECHO.OPERATION_ID.SIDECHAIN_BTC_WITHDRAW }],
		});

		if (withdrawOperation) {
			const block = await this.blockRepository.findByMongoId(withdrawOperation.block);

			if (block) {
				const result = `${block.round}-${withdrawOperation.trx_in_block}-${withdrawOperation.op_in_trx}`;
				body.sidchain_eth_withdraw = result;
			}
		}

		const withdrawIdNumber = body.withdraw_id.split('.')[2];
		const withdrawApproveOperations =  await this.operationRepository.find({
			'body.withdraw_id': withdrawIdNumber,
			id: ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_WITHDRAW,
		});

		if (!withdrawApproveOperations.length) {
			return <any>body;
		}

		const uniqueBlocksIds = withdrawApproveOperations.map(({ block }) => block);

		const blocks = await this.blockRepository.find({ _id: { $in: uniqueBlocksIds } });

		const listOfApprovals = withdrawApproveOperations.map((op) => {
			const operationBlock = blocks.find((b) => String(b._id) === String(op.block));
			return `${operationBlock.round}-${op.trx_in_block}`;
		});

		body.list_of_approvals = listOfApprovals;

		return <any>body;
	}
}
