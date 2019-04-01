import AbstractModel, { createSchema } from './abstract.model';
import * as ECHO from '../constants/echo.constants';
import * as MODEL from '../constants/model.constants';
import { Schema } from 'mongoose';
import { IOperation, IOperationRelation } from '../interfaces/IOperation';

const relationSchema = createSchema<IOperationRelation>({
	from: [String],
	to: String,
	accounts: [String],
	contract: String,
	assets: [String],
	token: String,
});

export default AbstractModel<IOperation<ECHO.OPERATION_ID>>(MODEL.NAME.OPERATION, {
	id: Number,
	body: Schema.Types.Mixed,
	result: Schema.Types.Mixed,
	_tx: { type: Schema.Types.ObjectId, ref: MODEL.NAME.TRANSACTION },
	_relation: relationSchema,
});
