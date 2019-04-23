import AbstractModel, { createSchema }  from './abstract.model';
import { Schema } from 'mongoose';
import { ITransfer, IMemo } from '../interfaces/ITransfer';
import * as MODEL from '../constants/model.constants';
import * as BALANCE from '../constants/balance.constants';

const memoSchema = createSchema<IMemo>({
	from: String,
	to: String,
	nonce: String,
	message: String,
});

export default AbstractModel<ITransfer<BALANCE.TYPE>>(MODEL.NAME.TANSFER, {
	_from: { ref: MODEL.NAME.ACCOUNT, $type: Schema.Types.ObjectId },
	_to: { ref: MODEL.NAME.ACCOUNT, $type: Schema.Types.ObjectId },
	amount: String,
	_contract: { ref: MODEL.NAME.CONTRACT, $type: Schema.Types.ObjectId },
	_asset: { ref: MODEL.NAME.ASSET, $type: Schema.Types.ObjectId },
	type: { enum: Object.values(BALANCE.TYPE), $type: String },
	memo: memoSchema,
}, {
	typeKey: '$type',
});
