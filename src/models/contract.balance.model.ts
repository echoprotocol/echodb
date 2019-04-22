import AbstractModel from './abstract.model';
import * as MODEL from '../constants/model.constants';
import { Schema } from 'mongoose';
import { IContractBalance } from '../interfaces/IContractBalance';

export default AbstractModel<IContractBalance>(MODEL.NAME.CONTRACT_BALANCE, {
	_contract: { type: Schema.Types.ObjectId, ref: MODEL.NAME.CONTRACT_BALANCE },
	asset: String,
	amount: String,
});
