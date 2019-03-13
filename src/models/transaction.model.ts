import AbstractModel from './abstract.model';
import { Schema } from 'mongoose';
import { ITransaction } from '../interfaces/ITransaction';
import * as MODEL from '../constants/model.constants';

const extensionsSchema = new Schema({}, { _id: false });

export default AbstractModel<ITransaction>(MODEL.NAME.TRANSACTION, {
	_block: { ref: MODEL.NAME.BLOCK, type: Schema.Types.ObjectId },
	ref_block_num: Number,
	ref_block_prefix: Number,
	expiration: String,
	extensions: [extensionsSchema],
	signatures: [String],
});
