import AbstractController from './abstract.controller';
import ApiModule from '../api.module';
import * as HTTP from '../../../constants/http.constants';
import AuthForm from '../forms/auth.form';
import UserService, { ERROR as USER_SERVICE_ERROR } from '../../../services/user.service';
import { ErrorMap } from '../../../types/error.map';
import { promisify } from 'util';
import { ActionProps } from '../../../types/api';

const ERROR = {
	USER_NOT_FOUND: 'user not found',
};

const SIGN_IN_ERROR_MAP: ErrorMap = {
	[USER_SERVICE_ERROR.USER_NOT_FOUND]: HTTP.CODE.NOT_FOUND,
	[USER_SERVICE_ERROR.PASSWORD_REJECTED]: [HTTP.CODE.NOT_FOUND, ERROR.USER_NOT_FOUND],
};

export default class UserController extends AbstractController {

	constructor(readonly authForm: AuthForm, readonly userService: UserService) {
		super();
	}

	initRoutes(addRoute: ApiModule['addRoute']) {
		addRoute(HTTP.METHOD.POST, '/api/v1/user/sign-in', [
			this.signIn.bind(this),
			this.authForm.verifyAuthData,
		]);

		addRoute(HTTP.METHOD.POST, '/api/v1/user/sign-out', [
			this.signOut.bind(this),
			this.authForm.onlyLogged,
		]);

		addRoute(HTTP.METHOD.GET, '/api/v1/user/me', [
			this.getMe.bind(this),
			this.authForm.onlyLogged,
		]);
	}

	public async signIn({ user, form, req }: ActionProps) {
		// TODO: add notLogged handler ???
		if (user) return user; // FIXME: shaddowed variables? check tslint rule
		try {
			const user = await this.userService.getByNameAndPassword(form.name, form.password);
			await promisify(req.logIn.bind(req))(user);
			return user;
		} catch (error) {
			this.parseError(error, SIGN_IN_ERROR_MAP);
		}
	}

	public async signOut({ req }: ActionProps) {
		req.logOut();
	}

	public async getMe({ user }: ActionProps) {
		return user;
	}

}
