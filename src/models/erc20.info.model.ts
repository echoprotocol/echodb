import AbstractModel from './abstract.model';
import { IERC20Info } from '../interfaces/IERC20Info';
import * as MODEL from '../constants/model.constants';
import { Schema } from 'mongoose';

export default AbstractModel<IERC20Info>(MODEL.NAME.ERC20_INFO, {
	_contract: { type: Schema.Types.ObjectId, ref: MODEL.NAME.CONTRACT },
	name: String,
	symbol: String,
	totalSupply: String,
});
