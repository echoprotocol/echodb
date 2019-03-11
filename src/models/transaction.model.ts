import { model, Schema } from 'mongoose';
import * as MODEL from '../constants/model.constant';
import { ITransactionDocument } from '../interfaces/ITransaction';

// TODO: describe schema
const extensionsSchema = new Schema({}, { _id: false });

// TODO: make all fields required
const txSchema = new Schema({
	block: { ref: MODEL.NAME.BLOCK, type: Schema.Types.ObjectId },
	ref_block_num: Number,
	ref_block_prefix: Number,
	expiration: String,
	extensions: [extensionsSchema],
	signatures: [String],
});

export default model<ITransactionDocument>(MODEL.NAME.TRANSACTION, txSchema);
