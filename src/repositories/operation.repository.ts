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

	async getRelatedSidechainOp(objId: string, relatedOpId: number): Promise<RELATED_OP_TYPE> {
		const relatedOperation = <RELATED_OP_TYPE>(await this.findOne({ id: relatedOpId, result: objId }));
		return relatedOperation;
	}
}
