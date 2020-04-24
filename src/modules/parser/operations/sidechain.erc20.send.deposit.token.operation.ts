import AbstractOperation from './abstract.operation';
import BlockRepository from '../../../repositories/block.repository';
import OperationRepository from '../../../repositories/operation.repository';
import EchoRepository from '../../../repositories/echo.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import { TDoc } from '../../../types/mongoose';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN;

export default class SidechainErc20SendDepositTokenOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN;

	constructor(
		private echoRepository: EchoRepository,
		private blockRepository: BlockRepository,
		private operationRepository: OperationRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {

		if (!body.deposit_id) {
			return this.validateRelation({ from: [body.committee_member_id], assets: [body.fee.asset_id] });
		}

		const depositObject = <any>(await this.echoRepository.getObject(body.deposit_id));

		if (!depositObject) {
			return this.validateRelation({ from: [body.committee_member_id], assets: [body.fee.asset_id] });
		}

		const { transaction_hash: txHash } = depositObject;

		const operations = <TDoc<IOperation<ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN>>[]>
			(await this.operationRepository.find({
				id: ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN,
				'body.transaction_hash': txHash,
			}));

		const modifaedOps = operations.map((op) => {
			op.body.deposit_id = body.deposit_id;
			return op.save();
		});

		await Promise.all(modifaedOps);

		return this.validateRelation({
			from: [body.committee_member_id],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;

		if (!body.deposit_id) {
			return <any>body;
		}

		const depositObject = <any>(await this.echoRepository.getObject(body.deposit_id));

		if (!depositObject) {
			return <any>body;
		}

		const { transaction_hash: txHash } = depositObject;

		const depositOperation = <TDoc<IOperation<ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN>>>
			(await this.operationRepository.findOne({
				id: ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN,
				'body.transaction_hash': txHash,
			}));

		if (depositOperation) {
			const block = await this.blockRepository.findByMongoId(depositOperation.block);

			if (block) {
				const result = `${block.round}-${depositOperation.trx_in_block}-${depositOperation.op_in_trx}`;
				body.sidchain_erc20_token_deposit = result;
			}
		}

		return <any>body;
	}
}
