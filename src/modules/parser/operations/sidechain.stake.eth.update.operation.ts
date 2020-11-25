import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import OperationRepository from 'repositories/operation.repository';
import { TDocument } from 'types/mongoose/tdocument';
type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_STAKE_ETH_UPDATE;
type RELATED_OP_TYPE = TDocument<IOperation<ECHO.OPERATION_ID.SIDECHAIN_ISSUE | ECHO.OPERATION_ID.SIDECHAIN_BURN>>;

export default class SidechainStakeEthUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_STAKE_ETH_UPDATE;

	constructor(
		private operationRepository: OperationRepository,
	) {
		super();
	}

	private async updateRelatedSidachainOpHash(relatedOperation: RELATED_OP_TYPE, hash: string): Promise<void> {
		if (!relatedOperation) {
			return;
		}
		const { body } = <RELATED_OP_TYPE>relatedOperation;
		if (!relatedOperation.body.transaction_hash) {
			body.transaction_hash = hash;
		}
		if (!relatedOperation.body.sidechain_type) {
			body.sidechain_type = 'eth';
		}
		await this.operationRepository.findByIdAndUpdate(relatedOperation._id, {
			$set: { body },
		});
	}

	private getOpType(resultObjectType: string): [number, string] {
		let type = '';
		let relatedOpId = 0;
		switch (resultObjectType) {
			case ECHO.DEPOSIT_ID_OBJECT: {
				relatedOpId = ECHO.OPERATION_ID.SIDECHAIN_ISSUE;
				type = 'Deposit';
			}
			case ECHO.WITHDRAW_ID_OBJECT: {
				relatedOpId = ECHO.OPERATION_ID.SIDECHAIN_BURN;
				type = 'Withdraw';
			}
			default: {
				type = '';
			}
		}
		return [relatedOpId, type];
	}

	async postParseUpdate<Y extends ECHO.KNOWN_OPERATION>(dOperation: TDocument<IOperation<Y>>): Promise<void> {
		const { body, result } = <IOperation<OP_ID>>dOperation;
		if (result.split) {
			const resultObjectType = result.split('.')[1];
			const [relatedOpId, type] = this.getOpType(resultObjectType);
			const relatedOperation = await this.operationRepository.getRelatedSidechainOp(result, relatedOpId);
			await this.updateRelatedSidachainOpHash(relatedOperation, body.transaction_hash);

			if (!body.type) {
				body.type = type;
			}
			if (!body.amount) {
				body.amount = relatedOperation.body.value;
			}

			await this.operationRepository.findByIdAndUpdate(dOperation._id, {
				$set: { body },
			});
		}
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.committee_member_id],
			assets: [body.fee.asset_id, body.asset_id],
		});
	}
}
