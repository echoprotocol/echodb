import AccountRepository from './../repositories/account.repository';
import BalanceRepository from './../repositories/balance.repository';
import AssetRepository from './../repositories/asset.repository';
import ProcessingError from '../errors/processing.error';
import { escapeRegExp } from '../utils/format';
import { IAccount } from '../interfaces/IAccount';
import { CORE_ASSET } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { removeDuplicates } from '../utils/common';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
};

type GetAccountsQuery = { name?: RegExp };

export default class AccountService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly assetRepository: AssetRepository,
	) {}

	async getAccount(id?: string, name?: string) {
		let dAccount;
		if (id) dAccount = await this.accountRepository.findById(id);
		else if (name) dAccount = await this.accountRepository.findOne({ name });
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		return dAccount;
	}

	async getAccounts(count: number, offset: number, name?: string) {
		const query: GetAccountsQuery = {};
		if (name) {
			query.name = new RegExp(escapeRegExp(name), 'i');
		}
		const [items, total] = await Promise.all([
			this.accountRepository.find(
				query,
				null,
				{ limit: count, skip: offset },
			),
			this.accountRepository.count(query),
		]);
		return { items, total };
	}

	async getAccountConcentrationRate(account: any) {
		const baseAsset = await this.assetRepository.findById(CORE_ASSET);

		if (!baseAsset) {
			return 0;
		};

		const delegateAccountQuery = {
			'options.delegating_account': account.id,
		};

		const delegateAccountArray = await this.accountRepository.find(delegateAccountQuery);

		const delegateAccountArrayId = delegateAccountArray.map(({ _id }) => _id);
		const uniqueAccountArrayId = [removeDuplicates([...delegateAccountArrayId, account._id])];

		const targetBalanceQuery = {
			amount: { $ne: '0' },
			_account: { $in: uniqueAccountArrayId },
			_contract: { $exists: false },
			_asset: baseAsset._id,
			type: TYPE.ASSET,
		};


		const allBalanceQuery = {
			amount: { $ne: '0' },
			_account: { $exists: true },
			_contract: { $exists: false },
			_asset: baseAsset._id,
			type: TYPE.ASSET,
		};


	}

	async updateAccountsConcentrationRate() {

	}

		

}
