import AbstractRepository from 'repositories/abstract.repository';
import AbstractForm from '../forms/abstract.form';
import AbstractJoiLanguage from '../forms/abstract.joi.language';
import RestError from '../../../errors/rest.error';
import FormError from '../../../errors/form.error';
import ProcessingError from '../../../errors/processing.error';
import * as Joi from 'joi';
import { MethodErrorMap } from '../../../types';
import { MongoId } from '../../../types/mongoose';
import { UseMiddleware } from 'type-graphql';
import { isMongoObjectId } from '../../../utils/validators';

export default abstract class AbstractResolver {

	resolveMongoField(value: MongoId, repository: AbstractRepository[] | AbstractRepository) {
		return isMongoObjectId(value) ? this.findMongoField(value, repository) : value;
	}

	async findMongoField(value: MongoId, repository: AbstractRepository[] | AbstractRepository) {
		if (Array.isArray(repository)) {
			const promises = [];
			for (let i = 0; i < repository.length; i += 1) {
				promises.push(repository[i].findByMongoId(value));
			}
			const result = await Promise.all(promises);
			for (let i = 0; i < result.length - 1; i += 1) {
				if (result[i]) {
					return result[i];
				}
			}
			return result[result.length - 1];
		}
		return repository.findByMongoId(value);
	}

	parseError(errorMap: MethodErrorMap, error: Error) {
		if (!(error instanceof ProcessingError)) throw error;
		const details = errorMap[error.message];
		if (!details) throw new Error('error is not listed in the error map');
		if (details instanceof Array) {
			const [code, message = error.message] = details;
			return new RestError(code, message);
		}
		return new RestError(details);
	}

}

export function handleError(errorMap: MethodErrorMap) {
	return function (target: AbstractResolver, _: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value.bind(target);
		descriptor.value = async function (...args: any[]) {
			try {
				return await original(...args);
			} catch (error) {
				throw this.parseError(errorMap, error);
			}
		};
		return descriptor;
	};
}

function validate(args: {}, joiSchema: Joi.Schema) {
	return Joi.validate(args, joiSchema, { language: AbstractJoiLanguage });
}

function throwJoiError(error: Joi.ValidationError) {
	const formError = new FormError();
	for (const { message, path, context } of error.details) {
		const field = path.join('.');
		const matches = message.match(/(?<={!{0,2})\w+(?=})/g);
		const variables = matches.reduce((obj, label) => {
			if (!context || !context.hasOwnProperty(label)) throw new Error('error has no needed property');
			obj[label] = context[label];
			return obj;
		}, <{ [key: string]: string }>{});
		formError.add(field, message, variables);
	}
	throw formError;
}

export function validateArgs({ joiSchema }: typeof AbstractForm) {
	return UseMiddleware(async ({ args }, next) => {
		const { error } = validate(args, joiSchema);
		if (!error) return next();
		throwJoiError(error);
	});
}

export function validateSubscriptionArgs(topics: string | string[], { joiSchema }: typeof AbstractForm) {
	return ({ args }: any) => {
		const { error } = validate(args, joiSchema);
		if (error) throwJoiError(error);
		return topics;
	};
}
