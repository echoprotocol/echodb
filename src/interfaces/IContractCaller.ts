import { NAME as ModelName } from '../constants/model.constants';
import { MongoId } from '../types/mongoose';

export const callerModelPath = 'callerModel';

export default interface IContractCaller {
	contract: MongoId;
	caller: MongoId;
	[callerModelPath]: ModelName.CONTRACT | ModelName.ACCOUNT;
}
