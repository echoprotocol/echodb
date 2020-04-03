import AbstractModel from './abstract.model';
import { Schema } from 'mongoose';
import * as MODEL from '../constants/model.constants';
import { IBlock } from '../interfaces/IBlock';

const signaturesSchema = new Schema({
	_step: Number,
	_value: Number,
	_signer: Number,
	_bba_sign: String,
}, { _id: false });

// TODO: describe schemas
const extensionsSchema = new Schema({}, { _id: false });
const verificationsSchema = new Schema({}, { _id: false });

export default AbstractModel<IBlock>(MODEL.NAME.BLOCK, {
	previous: String,
	timestamp: String,
	account: String,
	delegate: String,
	transaction_merkle_root: String,
	state_root_hash: String,
	result_root_hash: String,
	extensions: [extensionsSchema],
	ed_signature: String,
	verifications: [verificationsSchema],
	round: Number,
	rand: String,
	vm_root: [String],
	average_block_time: {
		type: Number, default: 0,
	},
	decentralization_rate: {
		type: Number, default: 0,
	},
	cert: {
		_rand: String,
		_block_hash: String,
		_producer: Number,
		_signatures: [signaturesSchema],
	},
});
