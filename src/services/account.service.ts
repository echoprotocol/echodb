import AccountRepository from './../repositories/account.repository';

export default class AccountService {

	constructor(
		readonly accountRepository: AccountRepository,
	) {}

	getAccount(id?: string, name?: string) {
		if (id) return this.accountRepository.findById(id);
		if (name) return this.accountRepository.findOne({ name });
	}

	async getAccounts(count: number, offset: number) {
		const [items, total] = await Promise.all([
			this.accountRepository.find({}, null, { limit: count, skip: offset }),
			this.accountRepository.count({}),
		]);
		return { items, total };
	}

}
