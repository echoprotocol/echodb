import AbstractModel from './abstract.model';
import * as BALANCE from '../constants/balance.constants';
import * as MODEL from '../constants/model.constants';
import { Schema } from 'mongoose';
import { IContractBalance } from '../interfaces/IContractBalance';

export default AbstractModel<IContractBalance>(MODEL.NAME.CONTRACT_BALANCE, {
	_owner: { $type: Schema.Types.ObjectId, ref: MODEL.NAME.CONTRACT_BALANCE },
	_asset: { $type: Schema.Types.ObjectId, ref: MODEL.NAME.ASSET },
	_contract: { $type: Schema.Types.ObjectId, ref: MODEL.NAME.CONTRACT_BALANCE },
	type: { enum: Object.values(BALANCE.TYPE), $type: String },
	amount: String,
}, {
	typeKey: '$type',
});
