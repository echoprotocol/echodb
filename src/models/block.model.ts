import { model, Schema } from 'mongoose';
import * as MODEL from '../constants/model.constant';
import { IBlockDocument } from '../interfaces/IBlock';

const signaturesSchema = new Schema({
	_step: Number,
	_value: Number,
	_signer: Number,
	_bba_sign: String,
}, { _id: false });

// TODO: describe schemas
const extensionsSchema = new Schema({}, { _id: false });
const verificationsSchema = new Schema({}, { _id: false });

// TODO: make all fields reequired
const blockSchema = new Schema({
	fullyParsed: { type: Boolean, default: false },
	previous: String,
	timestamp: String,
	witness: String,
	account: String,
	transaction_merkle_root: String,
	state_root_hash: String,
	result_root_hash: String,
	extensions: [extensionsSchema],
	witness_signature: String,
	ed_signature: String,
	verifications: [verificationsSchema],
	round: Number,
	rand: String,
	cert: {
		_rand: String,
		_block_hash: String,
		_producer: Number,
		_signatures: [signaturesSchema],
	},
});

export default model<IBlockDocument>(MODEL.NAME.BLOCK, blockSchema);
