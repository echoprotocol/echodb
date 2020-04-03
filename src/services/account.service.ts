import BN from 'bignumber.js';
import AccountRepository from './../repositories/account.repository';
import BalanceRepository from './../repositories/balance.repository';
import AssetRepository from './../repositories/asset.repository';
import EchoRepository from './../repositories/echo.repository';
import ProcessingError from '../errors/processing.error';
import { escapeRegExp } from '../utils/format';
import { CORE_ASSET } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { SORT_DESTINATION } from '../constants/api.constants';

import { removeDuplicates } from '../utils/common';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
};

type GetAccountsQuery = { name?: RegExp };
type OptionsAccountsQuery = { limit?: number, skip?: number, sort?: Object };

export default class AccountService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly assetRepository: AssetRepository,
		readonly echoRepository: EchoRepository,
	) {}

	async getAccount(id?: string, name?: string) {
		let dAccount;
		if (id) dAccount = await this.accountRepository.findById(id);
		else if (name) dAccount = await this.accountRepository.findOne({ name });
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		return dAccount;
	}

	async getAccounts(count: number, offset: number, name?: string, concentrationRateSort?: SORT_DESTINATION) {
		const query: GetAccountsQuery = {};
		if (name) {
			query.name = new RegExp(escapeRegExp(name), 'i');
		}
		const options: OptionsAccountsQuery = { limit: count, skip: offset };

		if (concentrationRateSort) {
			options.sort = { concentration_rate: concentrationRateSort };
		}
		const [items, total] = await Promise.all([
			this.accountRepository.find(
				query,
				null,
				options,
			),
			this.accountRepository.count(query),
		]);
		return { items, total };
	}

	async updateAccountConcentrationRate(account: any, asset: any, allBalance: BN, createCount: number): Promise<any> {
		const delegateAccountQuery = {
			'options.delegating_account': account.id,
		};

		const delegateAccountArray = await this.accountRepository.find(delegateAccountQuery);

		const delegateAccountArrayId = delegateAccountArray.map(({ _id }) => _id);
		const uniqueAccountArrayId = removeDuplicates([...delegateAccountArrayId, account._id]);
		const targetBalanceQuery = {
			amount: { $ne: '0' },
			_account: { $in: uniqueAccountArrayId },
			_contract: { $exists: false },
			_asset: asset._id,
			type: TYPE.ASSET,
		};

		const targetBalancesArray = await this.balanceRepository.find(targetBalanceQuery);

		const targetBalance = targetBalancesArray.reduce((acc, val) => acc.plus(val.amount), new BN(0));

		account.concentration_rate = 0;

		if (targetBalance.eq(0)) {
			return account.save();
		}

		const accountConcentrationRate = targetBalance.div(allBalance).div(createCount)
			.times(100).integerValue(BN.ROUND_CEIL).toNumber();
		account.concentration_rate = accountConcentrationRate;

		return account.save();
	}

	async updateAccountsConcentrationRate(): Promise<void> {
		const baseAsset = await this.assetRepository.findById(CORE_ASSET);

		if (!baseAsset) {
			return;
		}

		const allBalanceQuery = {
			amount: { $ne: '0' },
			_account: { $exists: true },
			_contract: { $exists: false },
			_asset: baseAsset._id,
			type: TYPE.ASSET,
		};

		const accounts = await this.accountRepository.find({});

		const allBalancesArray = await this.balanceRepository.find(allBalanceQuery);

		const allBalance = allBalancesArray.reduce((acc, val) => acc.plus(val.amount), new BN(0));

		const {
			parameters: {
				echorand_config: {
					_creator_count: createCount,
				},
			},
		} = await this.echoRepository.getGlobalProperties();

		await Promise.all(accounts.map(
			(a) => this.updateAccountConcentrationRate(a, baseAsset, allBalance, createCount),
		));
	}

}
