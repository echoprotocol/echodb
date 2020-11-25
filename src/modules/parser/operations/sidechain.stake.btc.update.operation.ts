import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import OperationRepository from 'repositories/operation.repository';
import { TDocument } from 'types/mongoose/tdocument';
type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_STAKE_BTC_UPDATE;

export default class SidechainStakeBtcUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_STAKE_BTC_UPDATE;

	constructor(
		private operationRepository: OperationRepository,
	) {
		super();
	}

	async postParseUpdate<Y extends ECHO.KNOWN_OPERATION>(dOperation: TDocument<IOperation<Y>>): Promise<void> {
		const { body, result } = <IOperation<OP_ID>>dOperation;

		const resultObjectType = result.split('.')[1];
		const [relatedOpId, type] = this.operationRepository.getOpType(resultObjectType);
		const relatedOperation = await this.operationRepository.getRelatedSidechainOp(result, relatedOpId);
		await this.operationRepository.updateRelatedSidachainOpHash(relatedOperation, body.transaction_hash, 'btc');
		if (!body.type) {
			body.type = type;
			await this.operationRepository.findByIdAndUpdate(dOperation._id, {
				$set: { body },
			});
		}
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		body.transaction_hash = body.btc_tx_info.out.tx_id;
		body.amount = {
			amount: body.btc_tx_info.out.amount,
			asset_id: ECHO.SBTC_ASSET,
		};
		return <any>body;
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.committee_member_id],
			assets: [body.fee.asset_id],
		});
	}

}
