import AbstractModel from './abstract.model';
import { Schema } from 'mongoose';
import { IOperation } from '../interfaces/IOperation';
import * as MODEL from '../constants/model.constants';
import * as ECHO from '../constants/echo.constants';

export default AbstractModel<IOperation<ECHO.OPERATION_ID>>(MODEL.NAME.OPERATION, {
	id: Number,
	body: Schema.Types.Mixed,
	result: Schema.Types.Mixed,
	_tx: { type: Schema.Types.ObjectId, ref: MODEL.NAME.TRANSACTION },
});
