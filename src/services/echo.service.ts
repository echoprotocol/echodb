import { removeDuplicates } from '../utils/common';
import AccountRepository from '../repositories/account.repository';
import EchoConnection from '../connections/echo.connection';

export default class EchoService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly echoConnection: EchoConnection,
	) {}

	async checkAccounts(accIds: string[]): Promise<void> {
		const accIdsToCheck: string[] = [];
		await Promise.all(removeDuplicates(accIds).map(async (accId) => {
			const dAccount = await this.accountRepository.findById(accId);
			if (!dAccount) accIdsToCheck.push(accId);
		}));
		const accounts = await this.echoConnection.echo.api.getAccounts(accIdsToCheck);
		await this.accountRepository.create(accounts);
	}

}
