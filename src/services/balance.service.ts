import AccountRepository from '../repositories/account.repository';
import BalanceRepository from '../repositories/balance.repository';
import ContractRepository from '../repositories/contract.repository';
import ProcessingError from '../errors/processing.error';
import * as BALANCE from '../constants/balance.constants';
import { MongoId } from '../types/mongoose';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
	BALANCE_NOT_FOUND: 'balance not found',
	CONTRACT_NOT_FOUND: 'contract not found',
};

export default class BalanceService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly contractRepository: ContractRepository,
	) {}

	// TODO: refactor coz of type
	async getBalance(count: number, offset: number, account: string, type?: BALANCE.TYPE) {
		const dAccount = await this.accountRepository.findById(account);
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		const query: { _account: MongoId, type?: string } = { _account: dAccount };
		if (type) query.type = type;
		const [items, total] = await Promise.all([
			this.balanceRepository.find(query, null, { limit: count, skip: offset, populate: '_contract' }),
			this.balanceRepository.count(query),
		]);
		for (const dBalance of items) {
			dBalance._account = dAccount;
		}
		return { items, total };
	}

	async getBalanceIn(account: string, contract: string) {
		const [dAccount, dContract] = await Promise.all([
			this.accountRepository.findById(account),
			this.contractRepository.findById(contract),
		]);
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		if (!dContract) throw new ProcessingError(ERROR.CONTRACT_NOT_FOUND);
		const dBalance = await this.balanceRepository.findByAccountAndContract(dAccount._id, dContract._id);
		if (!dBalance) throw new ProcessingError(ERROR.BALANCE_NOT_FOUND);
		dBalance._account = dAccount;
		dBalance._contract = dContract;
		return dBalance;
	}

}
