import * as Joi from 'joi';
import AbstractForm from './abstract.form';
import RestError from '../../../errors/rest.error';
import * as HTTP from '../../../constants/http.constants';

export default class AuthForm extends AbstractForm {

	@AbstractForm.joiValidator
	verifyAuthData(): void {
		// @ts-ignore
		return Joi.object({
			name: Joi.string().required(),
			password: Joi.string().required().min(9),
		});
	}

	onlyLogged(req: Express.Request): void {
		if (req.user) return;
		throw new RestError(HTTP.CODE.UNAUTHORIZED);
	}

}

// All validators should return void
