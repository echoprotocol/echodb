import AssetRepository from '../repositories/asset.repository';
import AccountRepository from '../repositories/account.repository';
import BalanceRepository from '../repositories/balance.repository';
import ContractBalanceRepository from '../repositories/contract.balance.repository';
import ContractRepository from '../repositories/contract.repository';
import RedisConnection from '../connections/redis.connection';
import ProcessingError from '../errors/processing.error';
import EchoService from '../services/echo.service';
import * as BALANCE from '../constants/balance.constants';
import * as ECHO from '../constants/echo.constants';
import { BigNumber as BN } from 'bignumber.js';
import { TDoc } from '../types/mongoose';
import { IAccount } from '../interfaces/IAccount';
import { IContract } from 'interfaces/IContract';
import { AccountId, ContractId } from 'types/echo';

export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
	ASSET_NOT_FOUND: 'asset not found',
	BALANCE_NOT_FOUND: 'balance not found',
	CONTRACT_NOT_FOUND: 'contract not found',
};

export default class BalanceService {

	constructor(
		readonly redisConnection: RedisConnection,
		readonly assetRepository: AssetRepository,
		readonly accountRepository: AccountRepository,
		readonly balanceRepository: BalanceRepository,
		readonly contractBalanceRepository: ContractBalanceRepository,
		readonly contractRepository: ContractRepository,
		readonly echoService: EchoService,
	) {}

	async getBalances(accounts: string[], type?: BALANCE.TYPE) {
		const dAccounts = await this.accountRepository.find({ id: { $in: accounts } });
		if (!dAccounts || !dAccounts.length) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
		const query: { _account: Object, type?: string } = { _account: { $in: dAccounts } };
		if (type) query.type = type;
		const dBalances = await this.balanceRepository.find(query);
		const dAccountsMap = new Map<string, TDoc<IAccount>>(dAccounts.map((dAccount) =>
			<[string, TDoc<IAccount>]>[dAccount._id.toString(), dAccount]));
		for (const dBalance of dBalances) {
			dBalance._account = dAccountsMap.get(dBalance._account.toString());
		}
		return dBalances;
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

	async takeFee(account: AccountId, { asset_id, amount }: ECHO.Fee) {
		const bnAmount = new BN(amount);
		if (bnAmount.eq(0)) return;
		const [dAccount, dAsset] = await Promise.all([
			this.accountRepository.findById(account),
			this.assetRepository.findById(asset_id),
		]);
		await this.balanceRepository.updateOrCreateByAccountAndAsset(
			dAccount,
			dAsset,
			bnAmount.negated().toString(),
			{ append: true },
		);
	}

	async getContractBalances(count: number, offset: number, contracts: ContractId[]) {
		const dContracts = await this.contractRepository.find({ id: { $in: contracts } });
		const query = { _contract: { $in: dContracts } };
		const [items, total] = await Promise.all([
			this.contractBalanceRepository.find(query, null, { limit: count, skip: offset }),
			this.contractBalanceRepository.count(query),
		]);
		const dContractsMap = new Map(dContracts.map((dContract) =>
			<[string, TDoc<IContract>]>[dContract._id.toString(), dContract]));
		for (const dBalance of items) {
			dBalance._contract = dContractsMap.get(dBalance._contract.toString());
		}
		return { items, total };
	}

}
