import AbstractModel from './abstract.model';
import * as MODEL from '../constants/model.constants';
import * as BALANCE from '../constants/balance.constants';
import { IBalance } from 'interfaces/IBalance';
import { Schema } from 'mongoose';

export default AbstractModel<IBalance<BALANCE.TYPE>>(MODEL.NAME.BALANCE, {
	_contract: { $type: Schema.Types.ObjectId, ref: MODEL.NAME.CONTRACT },
	// FIXME: use echo id ?
	_account: { $type: Schema.Types.ObjectId, ref: MODEL.NAME.ACCOUNT },
	asset: String,
	type: { $type: String, enum: Object.values(BALANCE.TYPE) },
	amount: String,
}, {
	typeKey: '$type',
});
