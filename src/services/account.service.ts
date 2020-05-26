import BN from 'bignumber.js';
import AccountRepository from './../repositories/account.repository';
import BalanceRepository from './../repositories/balance.repository';
import AssetRepository from './../repositories/asset.repository';
import EchoRepository from './../repositories/echo.repository';
import BlockRepository from './../repositories/block.repository';
import { IBlock } from '../interfaces/IBlock';
import { IAccount } from '../interfaces/IAccount';
import { IAsset } from '../interfaces/IAsset';
import { TDoc } from '../types/mongoose';
import { CORE_ASSET, OPERATION_ID } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { SORT_DESTINATION } from '../constants/api.constants';
import { STATUS } from '../constants/committee.constants';
import ProcessingError from '../errors/processing.error';
import { escapeRegExp } from '../utils/format';

import { removeDuplicates } from '../utils/common';
import OperationRepository from 'repositories/operation.repository';
import { TDocument } from 'types/mongoose/tdocument';
import { IOperation } from 'interfaces/IOperation';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
};

type GetAccountsQuery = { name?: RegExp };
type GetCommitteeQuery = { 'committee_options.status'?: string };
type OptionsAccountsQuery = { limit?: number, skip?: number, sort?: Object };

export default class AccountService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly assetRepository: AssetRepository,
		readonly echoRepository: EchoRepository,
		readonly blockRepository: BlockRepository,
		readonly operationRepository: OperationRepository,
	) {}

	async getAccount(id?: string, name?: string) {
		let dAccount;
		if (id) dAccount = await this.accountRepository.findById(id);
		else if (name) dAccount = await this.accountRepository.findOne({ name });
		if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		return dAccount;
	}

	async getAccounts(
		count: number,
		offset: number,
		name?: string,
		concentrationBalanceRateSort?: SORT_DESTINATION,
		concentrationHistroyRateSort?: SORT_DESTINATION,
	) {
		const query: GetAccountsQuery = {};
		if (name) {
			query.name = new RegExp(escapeRegExp(name), 'i');
		}
		const options: OptionsAccountsQuery = { limit: count, skip: offset };

		if (concentrationBalanceRateSort) {
			options.sort = { concentration_balance_rate: concentrationBalanceRateSort };
		} else if (concentrationHistroyRateSort) {
			options.sort = { concentration_history_rate: concentrationHistroyRateSort };
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

	async getCommitteeAccounts(
		count: number,
		offset: number,
		status?: STATUS,
	) {
		const query: GetCommitteeQuery = {};

		if (status && status !== STATUS.NONE) {
			query['committee_options.status'] = status;
		}

		const options: OptionsAccountsQuery = { limit: count, skip: offset };

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

	async updateAccountConcentrationRate(
		account: TDoc<IAccount>,
		asset: TDoc<IAsset>,
		allBalance: BN,
		allBlocks: TDoc<IBlock>[],
		createCount: number,
	): Promise<TDoc<IAccount>> {
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

		if (targetBalance.eq(0)) {
			account.concentration_balance_rate = 0;
		} else {
			const balanceConcentrationRate = targetBalance
				.div(allBalance)
				.div(createCount)
				.times(100)
				.integerValue(BN.ROUND_CEIL)
				.toNumber();

			account.concentration_balance_rate = balanceConcentrationRate;
		}

		const accountProducerTimes = allBlocks.filter(({ account: producer }) => producer === account.id).length;

		if (accountProducerTimes === 0) {
			account.concentration_balance_rate = 0;
		} else {
			const historyConcentrationRate = new BN(accountProducerTimes)
				.div(allBlocks.length)
				.times(100)
				.integerValue(BN.ROUND_CEIL)
				.toNumber();

			account.concentration_history_rate = historyConcentrationRate;
		}

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

		const [
			accounts, allBalancesArray, allBlocks,
		] = await Promise.all([
			this.accountRepository.find({}),
			this.balanceRepository.find(allBalanceQuery),
			this.blockRepository.find({}),
		]);

		const allBalance = allBalancesArray.reduce((acc, val) => acc.plus(val.amount), new BN(0));

		const {
			parameters: { echorand_config: { _creator_count: createCount } },
		} = await this.echoRepository.getGlobalProperties();

		await Promise.all(accounts.map((acc) =>
			this.updateAccountConcentrationRate(acc, baseAsset, allBalance, allBlocks, createCount)));
	}

	async getAccountCondition(id: string, timestamp: string) {

		const currentAccountUpdateOperations = await this.operationRepository.find({
			id: OPERATION_ID.ACCOUNT_UPDATE,
			timestamp: { $lt: timestamp },
			'body.account': id,
			'body.active': { $exists: true },
		}, {}, { sort: { timestamp: -1 }, limit: 1 });
		const account = await this.accountRepository.findById(id);
		if (currentAccountUpdateOperations.length) {
			account.active = (<TDocument<IOperation<OPERATION_ID.ACCOUNT_UPDATE>>>currentAccountUpdateOperations[0])
				.body.active;
		}
		const authority = {
			weight_threshold: account.active.weight_threshold,
			account_auths: account.active.account_auths.length ?
				account.active.account_auths.map((el: any[]) => ({ key: el[0], value: el[1] })) : [],
			key_auths: account.active.key_auths.length ?
				account.active.key_auths.map((el: any[]) => ({ key: el[0], value: el[1] })) : [],
			address_auths: account.active.address_auths.length ?
				account.active.address_auths.map((el: any[]) => ({ key: el[0], value: el[1] })) : [],
		};
		return authority;
	}

	async updateCommitteeLastExecutedOperation(
		accountId: string,
		opId: Number,
		blockRound: Number,
		transactionIndex: Number,
		operationIndex: Number,
		virtual: boolean,
	) {
		const account =  await this.accountRepository.findOne({
			id: accountId,
			'committee_options.status': STATUS.ACTIVE,
		});

		if (!account) {
			return;
		}
		const operation = `${blockRound}-${transactionIndex}-${operationIndex}${virtual ? '-virtual' : ''}`;
		account.committee_options.last_executed_operation = operation;
		account.committee_options.last_executed_operation_id = opId;
		await account.save();
	}
}
