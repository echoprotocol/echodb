import { Schema, model, Document, SchemaOptions } from 'mongoose';

type ObjectOfInterface<TInterface> = { [x in keyof TInterface]: any };
export default <TInterface>(name: string, defenition: ObjectOfInterface<TInterface>, options?: SchemaOptions) => {
	const schema = createSchema(defenition, options);
	return model<TInterface & Document>(name, schema);
};

export function createSchema<TInterface>(defenition: ObjectOfInterface<TInterface>, options?: SchemaOptions) {
	return new Schema(defenition, options);
}
