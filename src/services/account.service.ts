import AccountRepository from './../repositories/account.repository';
import ProcessingError from '../errors/processing.error';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
};

export default class AccountService {

	constructor(
		readonly accountRepository: AccountRepository,
	) {}

	async getAccount(id?: string, name?: string) {
		let dAccount;
		if (id) dAccount = await this.accountRepository.findById(id);
		else if (name) dAccount = await this.accountRepository.findOne({ name });
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		return dAccount;
	}

	async getAccounts(count: number, offset: number) {
		const [items, total] = await Promise.all([
			this.accountRepository.find({}, null, { limit: count, skip: offset }),
			this.accountRepository.count({}),
		]);
		return { items, total };
	}

}
