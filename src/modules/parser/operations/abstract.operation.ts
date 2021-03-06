import * as ECHO from '../../../constants/echo.constants';
import { relationResponse, RelationParameters  } from '../../../utils/validators';
import { IOperationRelation, IOperation } from '../../../interfaces/IOperation';
import { TDoc } from '../../../types/mongoose';
import { IBlock } from '../../../interfaces/IBlock';
import { TDocument } from 'types/mongoose/tdocument';
// FIXME: fix types
// @ts-ignore
export default abstract class AbstractOperation<T extends ECHO.OPERATION_ID>{
	abstract id: ECHO.OPERATION_ID;
	status: boolean = true;
	abstract parse<Y extends ECHO.KNOWN_OPERATION>(
		body: ECHO.OPERATION_PROPS<Y>,
		result: ECHO.OPERATION_RESULT<Y>,
		dBlock: TDoc<IBlock>,
		trxInBlock?: number,
		opInTrx?: number,
		virtual?: boolean,
		transactionHex?: string,
	): IOperationRelation | Promise<IOperationRelation>;

	public async modifyBody<Y extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<Y>,
		_result: ECHO.OPERATION_RESULT<Y>,
		_dBlock: TDoc<IBlock>,
	): Promise<Y extends ECHO.KNOWN_OPERATION ?
	ECHO.OPERATION_PROPS<Y> : unknown> { return operation.body; }

	public postInternalParse<Y extends ECHO.KNOWN_OPERATION>(
		_body: ECHO.OPERATION_PROPS<Y>,
		_result: ECHO.OPERATION_RESULT<Y>,
		_dBlock: TDoc<IBlock>,
		relation: IOperationRelation,
		_trxInBlock?: number,
		_opInTrx?: number,
		_virtual?: boolean,
	): IOperationRelation | Promise<IOperationRelation> { return relation; }

	public async postParseUpdate(
		_dOperation: TDocument<IOperation<ECHO.OPERATION_ID>>,
	): Promise<void> {}

	validateRelation(params: RelationParameters) {
		return relationResponse(params);
	}

	validateAndMergeRelations(params: RelationParameters, b: Partial<IOperationRelation>) {
		const a = this.validateRelation(params);
		for (const key of Object.keys(a) as (keyof IOperationRelation)[]) {
			if (b[key]) a[key].push(...b[key]);
		}
		return a;
	}

}
