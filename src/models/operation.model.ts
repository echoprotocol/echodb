import { model, Schema } from 'mongoose';
import * as MODEL from '../constants/model.constant';
import { IOperationDocument } from '../interfaces/IOperation';
import * as ECHO from '../constants/echo.constants';

export const schema = new Schema({
	id: Number,
	body: Schema.Types.Mixed,
	result: Schema.Types.Mixed,
});

export default model<IOperationDocument<ECHO.OPERATION_ID>>(MODEL.NAME.OPERATION, schema);
