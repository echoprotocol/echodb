import { Schema, model, Document, SchemaOptions } from 'mongoose';

export default <TInterface>(name: string, defenition: { [x in keyof TInterface]: any }, options?: SchemaOptions) => {
	const schema = new Schema(defenition, options);
	return model<TInterface & Document>(name, schema);
};
