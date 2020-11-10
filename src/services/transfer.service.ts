import { validators } from 'echojs-lib';
import AccountRepository from '../repositories/account.repository';
import ContractRepository from '../repositories/contract.repository';
import TransferRepository from 'repositories/transfer.repository';
import BalanceRepository from 'repositories/balance.repository';
import ContractBalanceRepository from 'repositories/contract.balance.repository';
import AssetRepository from 'repositories/asset.repository';
import * as TRANSFER from '../constants/transfer.constants';
import * as API from '../constants/api.constants';
// import * as ECHO from '../constants/echo.constants';
import * as BALANCE from '../constants/balance.constants';
import HISTORY_INTERVAL_ERROR from '../errors/history.interval.error';
import { parseHistoryOptions } from '../utils/common';

import { AccountId, ContractId, Amount, AssetId } from '../types/echo';
import { IAccount } from '../interfaces/IAccount';
import { IContract } from '../interfaces/IContract';
import { TDoc, MongoId } from '../types/mongoose';
import { IAsset } from 'interfaces/IAsset';
import { HistoryOptionsWithInterval } from '../interfaces/IHistoryOptions';
import { ITransfer } from 'interfaces/ITransfer';

type ParticipantDocTypeMap = {
	[TRANSFER.PARTICIPANT_TYPE.ACCOUNT]: TDoc<IAccount>;
	[TRANSFER.PARTICIPANT_TYPE.CONTRACT]: TDoc<IContract>;
};

export enum KEY {
	FROM = 'from',
	TO = 'to',
	CONTRACTS = 'contracts',
	ASSETS = 'assets',
	VALUE_TYPE = 'valueTypes',
	RELATION_TYPE = 'relationTypes',
	AMOUNT = 'amounts',
	SORT = 'sort',
}

interface GetTransactionParameters {
	[KEY.FROM]?: AccountId[];
	[KEY.TO]?: AccountId[];
	[KEY.CONTRACTS]?: ContractId[];
	[KEY.ASSETS]?: AssetId[];
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
		private assetRepository: AssetRepository,
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

		const query: Query[] = [
			{
				from: 'accounts',
				localField: '_fromAccount',
				foreignField: '_id',
				as: '_fromAccount',
			},
			{
				from: 'accounts',
				localField: '_toAccount',
				foreignField: '_id',
				as: '_toAccount',
			},
			{
				from: 'contracts',
				localField: '_fromContract',
				foreignField: '_id',
				as: '_fromContract',
			},
			{
				from: 'contracts',
				localField: '_toContract',
				foreignField: '_id',
				as: '_toContract',
			},
			{
				from: 'contracts',
				localField: '_contract',
				foreignField: '_id',
				as: '_contract',
			},
			{
				from: 'assets',
				localField: '_asset',
				foreignField: '_id',
				as: '_asset',
			},
		].map((subject) => ({ $lookup: subject }));

		const match: Query = {
			$and: [],
		};
		const otherParams: Query = {};

		if (params.relationTypes) {
			match.$and.push({ relationType: { $in: params.relationTypes } });
		}

		if (params.valueTypes) {
			match.$and.push({ valueType: { $in: params.valueTypes } });
		}

		if (params.amounts) {
			match.$and.push({ amount: { $in: params.amounts } });
		}

		if (params.contracts) {
			match.$and.push({ '_contract.id': { $in: params.contracts } });
		}

		if (params.assets) {
			match.$and.push({ '_asset.id': { $in: params.assets } });
		}

		if (params.from) {
			const addressesFromQuery: Query[] = [
				{ '_fromAccount.id': { $in: params.from } },
				{ '_fromContract.id': { $in: params.from } },
			];
			match.$and.push({ $or: addressesFromQuery });
		}
		if (params.to) {
			const addressesToQuery: Query[] = [
				{ '_toAccount.id': { $in: params.to } },
				{ '_toContract.id': { $in: params.to } },
			];
			match.$and.push({ $or: addressesToQuery });
		}

		if (Object.keys(otherParams).length) {
			match.$and.push({ $or: otherParams });
		}

		const unwind: Query[] = [
			'$_fromAccount',
			'$_toAccount',
			'$_fromContract',
			'$_toContract',
			'$_contract',
			'$_asset',
		].map((path) => ({ $unwind: { path, preserveNullAndEmptyArrays: true } }));

		const sortDestination = params.sort === API.SORT_DESTINATION.ASC ? 1 : -1;

		query.push(...unwind);
		match.$and.length && query.push({ $match: match });
		const total = (await this.transferRepository.aggregate(query)).length;
		query.push({ $skip : offset });
		query.push({ $limit : count });
		query.push({ $sort: { timestamp: sortDestination } });

		const items = await this.transferRepository.aggregate(query);

		return { items, total };
	}

	divideOperationByDate(
		array: ITransfer[],
		startDate: number,
		interval: number,
	): Map<number, ITransfer[]> {
		const blocksMap: Map<number, ITransfer[]> = new Map();
		return array.reduce((acc: Map<number, ITransfer[]>, val: ITransfer) => {
			const timestamp = val.timestamp.getTime() / 1000;
			const segmentNumber = Math.ceil((timestamp - startDate) / interval);
			return acc.set(segmentNumber, acc.get(segmentNumber) ? [...acc.get(segmentNumber), val] : [val]);
		}, blocksMap);
	}

	async getTargetByType (target: string, valueType: BALANCE.TYPE) {
		switch (valueType) {
			case BALANCE.TYPE.ASSET:
				return this.assetRepository.findById(target);
			case BALANCE.TYPE.TOKEN:
				return this.contractRepository.findById(target);
		}
	}

	async getTransfersHistoryDataWithInterval(
		targetSubject: string,
		historyOpts?: HistoryOptionsWithInterval,
	) {
		if (!historyOpts) {
			throw new Error(HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS);
		}

		let ratesMap: Object[] = [];

		const valueType = validators.isAssetId(targetSubject) ? BALANCE.TYPE.ASSET : BALANCE.TYPE.TOKEN;

		const targetType = await this.getTargetByType(targetSubject, valueType);

		if (!targetType) {
			return {
				ratesMap,
				total: 0,
			};
		}

		const { startDate, endDate, interval } = parseHistoryOptions(historyOpts);
		const startDateInISO = new Date(startDate);
		const endDateInISO = new Date(endDate);

		const targetTypeName = valueType === BALANCE.TYPE.ASSET ? '_asset' : '_contract';
		const query = { [targetTypeName]: targetType._id };
		const match = { ...query, timestamp: { $gte: startDateInISO, $lte: new Date(endDateInISO || Date.now()) } };

		const total = await this.transferRepository.count(match);

		const intervalMS = interval * 1000;

		const projectPrepare = { timestamp: { $toLong: '$timestamp' }, amount: { $toLong: '$amount' } };
		const group = {
			_id : {
				timestamp: {
					$subtract: [
						{ $divide: ['$timestamp', intervalMS] },
						{ $mod: [{ $divide: ['$timestamp', intervalMS] }, 1] },
					],
				},
			},
			count : { $sum : '$amount' },
			value : { $avg : '$timestamp' },
		};

		const sortByDate = { value: 1 };

		const projectResult = {
			_id: 0,
			startIntervalDateString: { $toString: { $toDate: '$value' } },
			rate: { $toLong: '$count' },
		};

		const pipeline = [
			{ $match: match },
			{ $project: projectPrepare },
			{ $group: group },
			{ $sort: sortByDate },
			{ $project: projectResult },
		];

		ratesMap = await this.transferRepository.aggregate(pipeline);

		return { ratesMap, total };
	}

}
