import AbstractOperation from './abstract.operation';
import BN from 'bignumber.js';
import BalanceRepository from 'repositories/balance.repository';
import AssetRepository from 'repositories/asset.repository';
import AccountRepository from 'repositories/account.repository';
import BlockRepository from '../../../repositories/block.repository';
import OperationRepository from '../../../repositories/operation.repository';
import EchoRepository from '../../../repositories/echo.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ISSUE;

export default class SidechainEthIssueOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ISSUE;

	constructor(
		private balanceRepository: BalanceRepository,
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
		private blockRepository: BlockRepository,
		private operationRepository: OperationRepository,
		private echoRepository: EchoRepository,

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
				new BN(amount).toString(),
				{ append: true },
			);
		return this.validateRelation({
			from: [body.account],
			assets: [body.fee.asset_id, body.value.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const depositObject = <any>(await this.echoRepository.getObject(body.deposit_id));

		if (depositObject) {
			const depositOperation =  await this.operationRepository.findOne({
				'body.deposit_id': depositObject.deposit_id,
				id: ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT,
			});

			if (depositOperation) {
				const block = await this.blockRepository.findByMongoId(depositOperation.block);

				if (block) {
					const result = `${block.round}-${depositOperation.trx_in_block}-${depositOperation.op_in_trx}`;
					body.sidchain_eth_deposit = result;
				}
			}
		}

		const depositSendOperations =  await this.operationRepository.find({
			'body.deposit_id': body.deposit_id,
			id: ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT,
		});

		if (!depositSendOperations.length) {
			return <any>body;
		}

		const uniqueBlocksIds = depositSendOperations.map(({ block }) => block);
		const blocks = await this.blockRepository.find({ _id: { $in: uniqueBlocksIds } });

		const listOfApprovals = depositSendOperations.map((op) => {
			const operationBlock = blocks.find((b) => String(b._id) === String(op.block));
			return `${operationBlock.round}-${op.trx_in_block}`;
		});

		body.list_of_approvals = listOfApprovals;

		return <any>body;
	}

}
