import AccountRepository from '../repositories/account.repository';
import ContractRepository from '../repositories/contract.repository';
import TransferRepository from 'repositories/transfer.repository';
import BalanceRepository from 'repositories/balance.repository';
import ContractBalanceRepository from 'repositories/contract.balance.repository';
import * as TRANSFER from '../constants/transfer.constants';
import { AccountId, AssetId, ContractId } from '../types/echo';
import { IAccount } from '../interfaces/IAccount';
import { IContract } from '../interfaces/IContract';
import { TDoc, MongoId } from '../types/mongoose';
import { IAsset } from 'interfaces/IAsset';

type ParticipantDocTypeMap = {
	[TRANSFER.PARTICIPANT_TYPE.ACCOUNT]: TDoc<IAccount>;
	[TRANSFER.PARTICIPANT_TYPE.CONTRACT]: TDoc<IContract>;
};

export enum KEY {
	FROM = 'from',
	TO = 'to',
	ACCOUNTS = 'accounts',
	CONTRACTS = 'contracts',
	ASSETS = 'assets',
	TOKENS = 'tokens',
}

interface GetHistoryParameters {
	[KEY.FROM]?: AccountId[];
	[KEY.TO]?: AccountId[];
	[KEY.ACCOUNTS]?: AccountId[];
	[KEY.CONTRACTS]?: ContractId[];
	[KEY.ASSETS]?: AssetId[];
	[KEY.TOKENS]?: ContractId[];
}

type Query = { [x: string]: Query[] | { $in: string[] } | { $or: Query[] } };

export default class TransferService {

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private transferRepository: TransferRepository,
		private balanceRepository: BalanceRepository,
		private contractBalanceRepository: ContractBalanceRepository,
	) {}

	fetchParticipant<T extends TRANSFER.PARTICIPANT_TYPE>(
		id: AccountId | ContractId,
		participantType: T = this.transferRepository.determineParticipantType(id) as T,
	): Promise<ParticipantDocTypeMap[T]> {
		switch (participantType) {
			case TRANSFER.PARTICIPANT_TYPE.ACCOUNT:
				return this.accountRepository.findById(id);
			case TRANSFER.PARTICIPANT_TYPE.CONTRACT:
				return this.contractRepository.findById(id);
		}
	}

	async updateOrCreateAsset(
		type: TRANSFER.PARTICIPANT_TYPE,
		dOwner: MongoId<IAccount | IContract>,
		dAsset: MongoId<IAsset>,
		amount: string,
	) {
		switch (type) {
			case TRANSFER.PARTICIPANT_TYPE.ACCOUNT:
				await this.balanceRepository.updateOrCreateByAccountAndAsset(
					<MongoId<IAccount>>dOwner,
					dAsset,
					amount,
					{ append: true },
				);
				break;
			case TRANSFER.PARTICIPANT_TYPE.CONTRACT:
				await this.contractBalanceRepository.updateOrCreateByOwnerAndAsset(
					<MongoId<IContract>>dOwner,
					dAsset,
					amount,
					{ append: true },
				);
				break;
		}
	}

	async getTransferHistory(count: number, offset: number, params: GetHistoryParameters) {
		const query: Query = {};
		const accountsQuery: Query[] = [];
		const otherQuery: Query[] = [];

		if (params.from) {
			query.$or = [{ _fromAccount: { $in: params.from } }, { _fromContract: { $in: params.from } }];
		}
		if (params.to) {
			query.$or = [{ _toAccount: { $in: params.to } }, { _toContract: { $in: params.to } }];
		}

		if (params.accounts) {
			accountsQuery.push(
				{ $or: [{ _fromAccount: { $in: params.from } }, { _fromContract: { $in: params.from } }] },
				{ $or: [{ _toAccount: { $in: params.to } }, { _toContract: { $in: params.to } }] },
			);
		}

		if (params.contracts) {
			otherQuery.push(
				{ _fromContract: { $in: params.contracts } },
				{ _toContract: { $in: params.contracts } },
				{ _contract: { $in: params.contracts } },
			);
		}
		if (params.assets) otherQuery.push({ _asset: { $in: params.assets } });

		if (accountsQuery.length && otherQuery.length) {
			query.$and = [{ $or: accountsQuery }, { $or: otherQuery }];
		} else {
			if (accountsQuery.length) query.$or = accountsQuery;
			if (otherQuery.length) query.$or = otherQuery;
		}

		const [items, total] = await Promise.all([
			this.transferRepository.find(
				query,
				null,
				{ skip: offset, limit: count },
			),
			this.transferRepository.count(query),
		]);
		return { total, items };
	}

}
