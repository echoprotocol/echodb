import AccountRepository from '../repositories/account.repository';
import BalanceRepository from '../repositories/balance.repository';
import ContractRepository from '../repositories/contract.repository';
import ProcessingError from '../errors/processing.error';
import * as BALANCE from '../constants/balance.constants';
import { MongoId } from '../types/mongoose';
import { IBalanceTokenDocument } from 'interfaces/IBalance';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
	CONTRACT_NOT_FOUND: 'contract not found',
};

export default class BalanceService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly contractRepository: ContractRepository,
	) {}

	// TODO: refactor coz of type
	async getBalance(account: string, type?: BALANCE.TYPE) {
		const dAccount = await this.accountRepository.findById(account);
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		const query: { _account: MongoId, type?: string } = { _account: dAccount };
		if (type) query.type = type;
		const [items, total] = await Promise.all([
			this.balanceRepository.find(query, null, { populate: '_contract' }),
			this.balanceRepository.count(query),
		]);
		for (const dBalance of items) {
			dBalance._account = dAccount;
		}
		return { items, total };
	}

	async getBalanceIn(account: string, contract: string) {
		const [dAccount, dContract] = await Promise.all([
			this.contractRepository.findById(contract),
			this.accountRepository.findById(account),
		]);
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		if (!dContract) throw new ProcessingError(ERROR.CONTRACT_NOT_FOUND);
		const balance =
			<IBalanceTokenDocument>await this.balanceRepository.findOne({ _account: dAccount, _contract: dContract });
		balance._account = dAccount;
		balance._contract = dContract;
		return balance;
	}

}
