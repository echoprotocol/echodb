import AccountRepository from '../repositories/account.repository';
import ContractRepository from '../repositories/contract.repository';
import TransferRepository from 'repositories/transfer.repository';
import BalanceRepository from 'repositories/balance.repository';
import ContractBalanceRepository from 'repositories/contract.balance.repository';
import * as TRANSFER from '../constants/transfer.constants';
import * as API from '../constants/api.constants';
// import * as ECHO from '../constants/echo.constants';
import * as BALANCE from '../constants/balance.constants';

import { AccountId, ContractId, Amount } from '../types/echo';
import { IAccount } from '../interfaces/IAccount';
import { IContract } from '../interfaces/IContract';
import { TDoc, MongoId } from '../types/mongoose';
import { IAsset } from 'interfaces/IAsset';
import { inspect } from 'util';

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

type Query = { [x: string]: Query[] | { $in: string[] } | { $or: Query[] } | any };

export default class TransferService {

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private transferRepository: TransferRepository,
		private balanceRepository: BalanceRepository,
		private contractBalanceRepository: ContractBalanceRepository,
	) { }

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






		// db.getCollection('transfers').aggregate([

		// 	{
		// 		$match: {
		// 			$and: [
		// 				{
		// 					$or: [
		// 						{
		// 							'_fromContract.id': { $in: ['1.2.566'] }
		// 						},
		// 						{
		// 							'_fromAccount.id': '1.2.566'
		// 						}
		// 					]
		// 				},
		// 				{
		// 					'_contract.id': {
		// 						$in: ['1.9.517']
		// 					}
		// 				},
		// 				{
		// 					'valueType': 'token'
		// 				}
		// 			]
		// 		}
		// 	},
		// 	{
		// 		$unwind: { path: '$_fromAccount', preserveNullAndEmptyArrays: true }
		// 	},
		// 	{
		// 		$unwind: { path: '$_toAccount', preserveNullAndEmptyArrays: true }
		// 	},
		// 	{
		// 		$unwind: { path: '$_fromContract', preserveNullAndEmptyArrays: true }
		// 	},
		// 	{
		// 		$unwind: { path: '$_toContract', preserveNullAndEmptyArrays: true }
		// 	},
		// 	{
		// 		$unwind: { path: '$_contract', preserveNullAndEmptyArrays: true }
		// 	}
		// ])





		const query: Query[] = [
			{
				$lookup: {
					from: 'accounts',
					localField: '_fromAccount',
					foreignField: '_id',
					as: '_fromAccount'
				}
			},
			{
				$lookup: {
					from: 'accounts',
					localField: '_toAccount',
					foreignField: '_id',
					as: '_toAccount'
				}
			},
			{
				$lookup: {
					from: 'contracts',
					localField: '_fromContract',
					foreignField: '_id',
					as: '_fromContract'
				}
			},
			{
				$lookup: {
					from: 'contracts',
					localField: '_toContract',
					foreignField: '_id',
					as: '_toContract'
				}
			},
			{
				$lookup: {
					from: 'contracts',
					localField: '_fromContract',
					foreignField: '_id',
					as: '_fromContract'
				}
			},
			{
				$lookup: {
					from: 'contracts',
					localField: '_contract',
					foreignField: '_id',
					as: '_contract'
				}
			},
		];

		const match: Query = {
			$and: []
		};
		const otherParams: Query = {};
		
		// const addressesToQuery: Query[] = [];

		if (params.relationTypes) {
			match.$and.push({ relationType: { $in: params.relationTypes } });
		}

		if (params.valueTypes) {
			match.$and.push({ valueType: { $in: params.valueTypes } });
		}

		if (params.amounts) {
			match.$and.push({ amount: { $in: params.amounts } });
		}

		// if (params.contracts) otherParams._contract = { $in: params.contracts };
		if (params.from) {
			const addressesFromQuery: Query[] = [
				{ '_fromAccount.id': { $in: params.from } },
				{ '_fromContract.id': { $in: params.from } },
			];
			match.$and.push({ $or: addressesFromQuery });
		}
		// if (params.to) {
		// 	addressesToQuery.push(
		// 		{ _toAccount: { $in: params.from } },
		// 		{ _toContract: { $in: params.from } },
		// 	)
		// 	addressesQuery.push({ $or: addressesToQuery })
		// 	// match._toAccount = { $in: params.to };
		// 	// match._toContract = { $in: params.to };
		// }


		if (Object.keys(otherParams).length) {
			match.$and.push({ $or: otherParams })
		}

		const unwind/*: Query[]*/ = ['$_fromAccount', '$_toAccount', '$_fromContract', '$_toContract', '$_contract']
			.map((path) => ({ $unwind: { path, preserveNullAndEmptyArrays: true } }))

		const sortDestination = params.sort === API.SORT_DESTINATION.ASC ? 1 : -1;

		if (match.$and.length) {
			query.push({ $match: match })
		};

		query.push(...unwind);
		query.push({ $skip : offset });
		query.push({ $limit : count });
		query.push({ $sort: { timestamp: sortDestination } });

		console.log(inspect(query, false, null, true))
		const [items] = await Promise.all([
			this.transferRepository.aggregate(query),
		]);
		console.log('items: ', items)
		return { total: 0, items };
	}

}
