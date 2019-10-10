import AccountRepository from '../repositories/account.repository';
import ContractRepository from '../repositories/contract.repository';
import TransferRepository from 'repositories/transfer.repository';
import BalanceRepository from 'repositories/balance.repository';
import ContractBalanceRepository from 'repositories/contract.balance.repository';
import * as TRANSFER from '../constants/transfer.constants';
import * as API from '../constants/api.constants';
import * as ECHO from '../constants/echo.constants';
import * as BALANCE from '../constants/balance.constants';

import { AccountId, ContractId, Amount } from '../types/echo';
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
	CONTRACTS = 'contracts',
	VALUE_TYPE = 'valueTypes',
	RELATION_TYPE = 'relationTypes',
	AMOUNT = 'amounts',
	SORT = 'sort',
}

interface GetTransactionParameters {
	[KEY.FROM]?: AccountId[];
	[KEY.TO]?: AccountId[];
	[KEY.CONTRACTS]?: ContractId[];
	[KEY.VALUE_TYPE]?: BALANCE.TYPE[];
	[KEY.RELATION_TYPE]?: TRANSFER.TYPE[];
	[KEY.AMOUNT]?: Amount[];
	[KEY.SORT]?: API.SORT_DESTINATION;
}

type Query = { [x: string]: Query[] | { $in: (ECHO.OPERATION_ID | string)[] } | { $or: Query[] } };

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

	async getHistory(count: number, offset: number, params: GetTransactionParameters) {
		const query: Query = {};
		const addressesQuery: Query[] = [];
		const addressesFromQuery: Query[] = [];
		const addressesToQuery: Query[] = [];

		if (params.relationTypes) query.relationType = { $in: params.relationTypes };
		if (params.valueTypes) query.valueTypes = { $in: params.valueTypes };
		if (params.amounts) query.amounts = { $in: params.amounts };
		if (params.contracts) query.contracts = { $in: params.contracts };
		if (params.from) {
			addressesFromQuery.push(
				{ _fromAccount: { $in: params.from } },
				{ _fromContract: { $in: params.from } },
			)
			addressesQuery.push({ $or: addressesFromQuery })
			// query._fromAccount = { $in: params.from };
			// query._fromContract = { $in: params.from };
		}
		if (params.to) {
			addressesToQuery.push(
				{ _toAccount: { $in: params.from } },
				{ _toContract: { $in: params.from } },
			)
			addressesQuery.push({ $or: addressesToQuery })
			// query._toAccount = { $in: params.to };
			// query._toContract = { $in: params.to };
		}

		if (addressesQuery.length) {
			query.$and = [{ $or: addressesQuery }];
		}

		const sortDestination = params.sort === API.SORT_DESTINATION.ASC ? 1 : -1;
		const [items, total] = await Promise.all([
			this.transferRepository.find(
				query,
				null,
				{ skip: offset, limit: count, sort: { timestamp: sortDestination } },
			),
			this.transferRepository.count(query),
		]);
		return { total, items };
	}

}
