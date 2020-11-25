import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import { IOperation } from '../interfaces/IOperation';
import OperationModel from '../models/operation.model';
import * as ECHO from '../constants/echo.constants';
import { TDocument } from 'types/mongoose/tdocument';

type RELATED_OP_TYPE = TDocument<IOperation<ECHO.OPERATION_ID.SIDECHAIN_ISSUE | ECHO.OPERATION_ID.SIDECHAIN_BURN>>;
export default class OperationRepository extends AbstractRepository<IOperation<ECHO.OPERATION_ID>> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, OperationModel);
	}

	getOpType(resultObjectType: string): [number, string] {
		let type = '';
		let relatedOpId = 0;
		switch (resultObjectType) {
			case ECHO.DEPOSIT_ID_OBJECT: {
				relatedOpId = ECHO.OPERATION_ID.SIDECHAIN_ISSUE;
				type = 'Deposit';
				break;
			}
			case ECHO.WITHDRAW_ID_OBJECT: {
				relatedOpId = ECHO.OPERATION_ID.SIDECHAIN_BURN;
				type = 'Withdraw';
				break;
			}
			default: {
				type = '';
			}
		}
		return [relatedOpId, type];
	}

	async getRelatedSidechainOp(objId: string, relatedOpId: number): Promise<RELATED_OP_TYPE> {
		const relatedOperation = <RELATED_OP_TYPE>(await this.findOne({ id: relatedOpId, result: objId }));
		return relatedOperation;
	}

	async updateRelatedSidachainOpHash(
		relatedOperation: RELATED_OP_TYPE,
		hash: string,
		sidechainType: string,
	): Promise<void> {
		if (!relatedOperation) {
			return;
		}
		const { body } = <RELATED_OP_TYPE>relatedOperation;
		if (!relatedOperation.body.transaction_hash) {
			body.transaction_hash = hash;
		}
		if (!relatedOperation.body.sidechain_type) {
			body.sidechain_type = sidechainType;
		}
		await this.findByIdAndUpdate(relatedOperation._id, {
			$set: { body },
		});
	}
}
