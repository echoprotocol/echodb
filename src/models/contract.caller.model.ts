import { NAME as ModelName } from '../constants/model.constants';
import abstractModel from './abstract.model';
import IContractCaller, { callerModelPath } from '../interfaces/IContractCaller';
import { Schema } from 'mongoose';

const contractCallerModel = abstractModel<IContractCaller>(ModelName.CONTRACT_CALLER, {
	contract: { type: Schema.Types.ObjectId, required: true, ref: ModelName.CONTRACT, index: true },
	[callerModelPath]: { type: String, required: true, enum: [ModelName.CONTRACT, ModelName.ACCOUNT] },
	caller: { type: Schema.Types.ObjectId, required: true, refPath: callerModelPath, index: true },
});

export default contractCallerModel;
