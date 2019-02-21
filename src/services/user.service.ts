import { compareSync } from 'bcrypt';
import UserRepository from '../repositories/user.repository';
import ProcessingError from '../errors/processing.error';

export const ERROR = {
	USER_NOT_FOUND: 'user not found',
	PASSWORD_REJECTED: 'password rejected',
};

export default class UserService {

	constructor(readonly userRepository: UserRepository) {}

	async getByNameAndPassword(name: string, password: string) {
		const user = await this.userRepository.findByName(name);
		if (!user) throw new ProcessingError(ERROR.USER_NOT_FOUND);
		if (!compareSync(password, user.password)) throw new ProcessingError(ERROR.PASSWORD_REJECTED);
		return user;
	}

}
