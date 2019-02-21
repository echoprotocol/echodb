import * as Joi from 'joi';
import FormError from '../../../errors/form.error';
import test from './joi';

export default abstract class AbstractForm {

	protected static joiValidator(target: AbstractForm, propertyKey: string): PropertyDescriptor {
		const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
		const schema: Joi.Schema = descriptor.value();
		return {
			...descriptor,
			value: (req: Express.Request) => {
				// TODO: add options
				const { error, value } = Joi.validate(req.form, schema, { language: test });
				if (error) throw AbstractForm.joiErrorToFormError(error);
				// if (error) {
				// 	console.log(error.details[0].context);
				// 	throw error;
				// }
				req.form = value;
			},
		};
	}

	static joiErrorToFormError(error: Joi.ValidationError): FormError {
		const formError = new FormError();
		for (const { message, path, context } of error.details) {
			const field = path.join('.');
			// TODO: move regex to a constant
			const matches = message.match(/(?<={!{0,2})\w+(?=})/g);
			const variables = matches.reduce((obj, label) => {
				// TODO: use constant. throw to raven. do smth
				if (!context || !context.hasOwnProperty(label)) throw new Error('error has no needed property');
				// FIXME: fix types
				obj[label] = <string>context[label].toString();
				return obj;
			}, <{ [key: string]: string }>{});
			formError.add(field, message, variables);
		}
		return formError;
	}

}
