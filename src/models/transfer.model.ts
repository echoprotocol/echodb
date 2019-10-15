import AbstractModel from './abstract.model';
import { Schema } from 'mongoose';
import { ITransfer } from '../interfaces/ITransfer';
import * as MODEL from '../constants/model.constants';
import * as BALANCE from '../constants/balance.constants';
import * as TRANSFER from '../constants/transfer.constants';

export default AbstractModel<ITransfer>(MODEL.NAME.TANSFER, {
	_fromAccount: { ref: MODEL.NAME.ACCOUNT, $type: Schema.Types.ObjectId },
	_fromContract: { ref: MODEL.NAME.CONTRACT, $type: Schema.Types.ObjectId },
	_toAccount: { ref: MODEL.NAME.ACCOUNT, $type: Schema.Types.ObjectId },
	_toContract: { ref: MODEL.NAME.CONTRACT, $type: Schema.Types.ObjectId },
	_contract: { ref: MODEL.NAME.CONTRACT, $type: Schema.Types.ObjectId },
	_asset: { ref: MODEL.NAME.ASSET, $type: Schema.Types.ObjectId },
	amount: String,
	timestamp: Date,
	relationType: { enum: Object.values(TRANSFER.TYPE), $type: String },
	valueType: { enum: Object.values(BALANCE.TYPE), $type: String },
}, {
	typeKey: '$type',
});
