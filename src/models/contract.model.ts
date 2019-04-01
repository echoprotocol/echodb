import AbstractModel from './abstract.model';
import * as MODEL from '../constants/model.constants';
import * as CONTRACT from '../constants/contract.constants';
import { IContract } from '../interfaces/IContract';
import { Schema } from 'mongoose';

export default AbstractModel<IContract>(MODEL.NAME.CONTRACT, {
	id: String,
	_registrar: { ref: MODEL.NAME.ACCOUNT, $type: Schema.Types.ObjectId },
	eth_accuracy: Boolean,
	supported_asset_id: String,
	type: { $type: String, enum: Object.values(CONTRACT.TYPE) },
}, {
	typeKey: '$type',
});
