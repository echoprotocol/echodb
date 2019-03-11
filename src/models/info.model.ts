import { model, Schema } from 'mongoose';
import * as MODEL from '../constants/model.constant';
import { IInfoDocument } from '../interfaces/IInfo';

const schema = new Schema({
	key: String,
	value: Schema.Types.Mixed,
});

export default model<IInfoDocument>(MODEL.NAME.INFO, schema);
