import * as Joi from 'joi';

const metadataKey = Symbol('rulesMap');

type JoiSchemaMap = { [x: string]: Joi.Schema };

export default abstract class AbstractForm {

	static get joiSchema(): Joi.Schema {
		const schemaMap: JoiSchemaMap = Reflect.getMetadata(metadataKey, this.prototype) || {};
		const schema = Joi.object().keys(schemaMap);
		return this.append(schema);
	}

	static append(schema: Joi.ObjectSchema): Joi.ObjectSchema {
		return schema;
	}

}

// TODO: do not mix type-graphql validation and joi validation
export function rule(schema: Joi.Schema) {
	return function (target: Object, propertyKey: string) {
		const metadata: JoiSchemaMap = Reflect.getMetadata(metadataKey, target) || {};
		metadata[propertyKey] = schema;
		Reflect.defineMetadata(metadataKey, metadata, target);
	};
}
