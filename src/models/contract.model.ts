import AbstractModel, { createSchema } from './abstract.model';
import * as MODEL from '../constants/model.constants';
import * as CONTRACT from '../constants/contract.constants';
import { IContract, ITokenInfo } from '../interfaces/IContract';
import { Schema } from 'mongoose';

const erc20infoSchema = createSchema<ITokenInfo>({
	total_supply: String,
	name: String,
	symbol: String,
	decimals: String,
});

export default AbstractModel<IContract>(MODEL.NAME.CONTRACT, {
	id: String,
	_registrar: { ref: MODEL.NAME.ACCOUNT, $type: Schema.Types.ObjectId },
	eth_accuracy: Boolean,
	supported_asset_id: String,
	type: { $type: String, enum: Object.values(CONTRACT.TYPE) },
	token_info: erc20infoSchema,
	_block: { ref: MODEL.NAME.BLOCK, $type: Schema.Types.ObjectId },
	problem: { $type: Boolean, default: false },
}, {
	typeKey: '$type',
});
