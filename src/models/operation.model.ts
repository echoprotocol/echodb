import AbstractModel, { createSchema } from './abstract.model';
import * as ECHO from '../constants/echo.constants';
import * as MODEL from '../constants/model.constants';
import { Schema } from 'mongoose';
import { IOperation, IOperationRelation } from '../interfaces/IOperation';

const relationSchema = createSchema<IOperationRelation>({
	from: [String],
	to: [String],
	accounts: [String],
	contracts: [String],
	assets: [String],
	tokens: [String],
});

export default AbstractModel<IOperation<ECHO.OPERATION_ID>>(MODEL.NAME.OPERATION, {
	id: Number,
	body: Schema.Types.Mixed,
	result: Schema.Types.Mixed,
	block: { ref: MODEL.NAME.BLOCK, type: Schema.Types.ObjectId },
	virtual: Boolean,
	_tx: { type: Schema.Types.ObjectId, ref: MODEL.NAME.TRANSACTION },
	timestamp: Date,
	op_in_trx: { type: Number, default: 0 },
	trx_in_block: { type: Number, default: 0 },
	trx_hex: String,
	_relation: relationSchema,
	vop_index: { type: Number, required: false, default: null },
	internal_operations_count: { type: Number, required: true, default: 0 },
});
