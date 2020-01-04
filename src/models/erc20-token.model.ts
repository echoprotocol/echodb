import AbstractModel from './abstract.model';
import * as MODEL from '../constants/model.constants';
import { Schema } from 'mongoose';
import IERC20Token from '../interfaces/IERC20Token';

const erc20TokenModel = AbstractModel<IERC20Token>(MODEL.NAME.ERC20_TOKEN, {
	id: { type: String, index: true, unique: true },
	owner: { ref: MODEL.NAME.ACCOUNT, type: Schema.Types.ObjectId },
	eth_addr: { type: String },
	contract: { ref: MODEL.NAME.CONTRACT, type: Schema.Types.ObjectId, unique: true },
	name: { type: String },
	symbol: { type: String },
	decimals: { type: Number },
});

export default erc20TokenModel;
