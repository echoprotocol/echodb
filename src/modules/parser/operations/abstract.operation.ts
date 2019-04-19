import * as ECHO from '../../../constants/echo.constants';
import { relationResponse, RelationParameters  } from '../../../utils/validators';
import { IOperationRelation } from '../../../interfaces/IOperation';
// FIXME: fix types
// @ts-ignore
export default abstract class AbstractOperation<T extends ECHO.OPERATION_ID>{
	abstract id: ECHO.OPERATION_ID;
	status: boolean = true;
	abstract parse<Y extends ECHO.OPERATION_ID>(
		body: ECHO.OPERATION_PROPS[Y],
		result: ECHO.OPERATION_RESULT[Y],
	): IOperationRelation | Promise<IOperationRelation>;

	validateRelation(params: RelationParameters) {
		return relationResponse(params);
	}
}
