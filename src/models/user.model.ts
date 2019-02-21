import { model, Schema } from 'mongoose';
import MODEL from '../constants/model.constant';
import { IUserDocument } from '../interfaces/IUserDocument';

const schema = new Schema({
	email: String,
	name: String,
	password: String,
});

export default model<IUserDocument>(MODEL.NAME.USER, schema);
