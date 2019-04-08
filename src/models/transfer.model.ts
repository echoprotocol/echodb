import AbstractModel, { createSchema }  from './abstract.model';
import { Schema } from 'mongoose';
import { ITransfer, IMemo } from '../interfaces/ITransfer';
import * as MODEL from '../constants/model.constants';

const memoSchema = createSchema<IMemo>({
	from: String,
	to: String,
	nonce: String,
	message: String,
});

export default AbstractModel<ITransfer>(MODEL.NAME.TANSFER, {
	_from: { ref: MODEL.NAME.ACCOUNT, type: Schema.Types.ObjectId },
	_to: { ref: MODEL.NAME.ACCOUNT, type: Schema.Types.ObjectId },
	amount: Number,
	_asset: { ref: MODEL.NAME.ASSET, type: Schema.Types.ObjectId },
	memo: memoSchema,
});
