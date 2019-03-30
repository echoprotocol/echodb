import * as mongoose from 'mongoose';

export function isMongoObjectId(value: string | number | any) {
	return mongoose.Types.ObjectId.isValid(value);
}
