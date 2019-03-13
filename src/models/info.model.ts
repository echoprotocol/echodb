import AbstractModel from './abstract.model';
import { Schema } from 'mongoose';
import { IInfo } from '../interfaces/IInfo';
import * as MODEL from '../constants/model.constants';

export default AbstractModel<IInfo>(MODEL.NAME.INFO, {
	key: String,
	value: Schema.Types.Mixed,
});
