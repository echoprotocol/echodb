import AccountRepository from '../repositories/account.repository';
import EchoConnection from '../connections/echo.connection';
import { IAccount } from '../interfaces/IAccount';
import { TDoc } from '../types/mongoose';
import { removeDuplicates } from '../utils/common';

export default class EchoService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly echoConnection: EchoConnection,
	) {}

	async checkAccounts(toCheck: string[]): Promise<TDoc<IAccount>[]> {
		const toFetch: string[] = [];
		const dAccountsMap: Map<string, TDoc<IAccount>> = new Map();
		await Promise.all(removeDuplicates(toCheck).map(async (accoundId) => {
			const dAccount = await this.accountRepository.findById(accoundId);
			if (dAccount) dAccountsMap.set(accoundId, dAccount);
			else toFetch.push(accoundId);
		}));
		if (toFetch.length) {
			const accounts = await this.echoConnection.echo.api.getAccounts(toFetch);
			const dAccounts = await this.accountRepository.create(accounts);
			for (const dAccount of dAccounts) {
				dAccountsMap.set(dAccount.id, dAccount);
			}
		}
		return toCheck.map((id) => dAccountsMap.get(id));
	}

}
