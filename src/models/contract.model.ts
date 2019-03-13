import AbstractModel from './abstract.model';
import { IContract } from '../interfaces/IContract';
import * as MODEL from '../constants/model.constants';
import * as CONTRACT from '../constants/contract.constants';

export default AbstractModel<IContract>(MODEL.NAME.CONTRACT, {
	id: String,
	registrar: String,
	eth_accuracy: Boolean,
	supported_asset_id: String,
	type: { $type: String, enum: Object.values(CONTRACT.TYPE) },
}, {
	typeKey: '$type',
});
