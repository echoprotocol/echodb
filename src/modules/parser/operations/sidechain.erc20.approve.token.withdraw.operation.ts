import AbstractOperation from './abstract.operation';
import BlockRepository from '../../../repositories/block.repository';
import OperationRepository from '../../../repositories/operation.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW;

export default class SidechainErc20ApproveTokenWithdrawOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW;

	constructor(
		private blockRepository: BlockRepository,
		private operationRepository: OperationRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const withdrawOperation =  await this.operationRepository.findOne({
			'body.withdraw_id': `1.18.${body.withdraw_id}`,
			id: ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN,
		});

		if (!withdrawOperation) {
			return <any>body;
		}

		const block = await this.blockRepository.findByMongoId(withdrawOperation.block);

		if (!block) {
			return <any>body;
		}

		const result = `${block.round}-${withdrawOperation.trx_in_block}-${withdrawOperation.op_in_trx}`;
		body.sidchain_erc_20_withdraw_token = result;
		return <any>body;
	}
}
