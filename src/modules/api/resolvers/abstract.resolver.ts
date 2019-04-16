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

	resolveMongoField(value: MongoId, repository: AbstractRepository) {
		return isMongoObjectId(value) ? repository.findByMongoId(value) : value;
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

export function validateArgs({ joiSchema }: typeof AbstractForm) {
	return UseMiddleware(async ({ args }, next) => {
		const { error } = Joi.validate(args, joiSchema, { language: AbstractJoiLanguage });
		if (!error) return next();
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
	});
}
