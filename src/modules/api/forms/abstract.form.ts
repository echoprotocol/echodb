import 'reflect-metadata';
import * as Joi from 'joi';

const metadataKey = Symbol('rulesMap');

type JoiSchemaMap = { [x: string]: Joi.Schema };

export default abstract class AbstractForm {

	static get joiSchema(): JoiSchemaMap {
		return Reflect.getOwnMetadata(metadataKey, this.prototype) || {};
	}

}
// TODO: do not mix type-graphql validation and joi validation
export function rule(schema: Joi.Schema) {
	return function (target: Object, propertyKey: string) {
		const metadata: JoiSchemaMap = Reflect.getOwnMetadata(metadataKey, target) || {};
		metadata[propertyKey] = schema;
		Reflect.defineMetadata(metadataKey, metadata, target);
	};
}
