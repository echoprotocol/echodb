import AbstractRepository from './abstract.repository';
import InternalError, { assert } from '../errors/internal.error';
import RavenHelper from '../helpers/raven.helper';
import RedisConnection from '../connections/redis.connection';
import TransferModel from '../models/transfer.model';
import ProcessingError from '../errors/processing.error';
import * as BALANCE from '../constants/balance.constants';
import * as TRANSFER from '../constants/transfer.constants';
import * as REDIS from '../constants/redis.constants';
import { ITransfer, ITransferExtended } from '../interfaces/ITransfer';
import { AccountId, ContractId } from '../types/echo';
import { validators } from 'echojs-lib';
import { TDoc } from 'types/mongoose';
import { IAccount } from '../interfaces/IAccount';
import { IContract } from '../interfaces/IContract';
import { Overwrite } from '../types';

type AccountOrContractDoc = TDoc<IAccount> | TDoc<IContract>;
const { isAccountId, isContractId } = validators;
const ERROR = {
	UNKNOWN_PARTICIPANT_TYPE: 'unknown participant type',
	UNKNOWN_TRANSFER_TYPE: 'unknown transfer type',
	UNKNOWN_RECEIVER_TYPE: 'unknown receiver type',
	UNKNOWN_SENDER_TYPE: 'unknown sender type',
	CAN_NOT_DETERMINE_PARTICIPANTS: 'can not determine participants',
};

export default class TransferRepository extends AbstractRepository<ITransfer<BALANCE.TYPE>> {

	constructor(
		ravenHelper: RavenHelper,
		private redisConnection: RedisConnection,
	) {
		super(ravenHelper, TransferModel);
	}

	determineRelationType(from: AccountId | ContractId, to: AccountId | ContractId): TRANSFER.TYPE {
		const fromType = this.determineParticipantType(from);
		const toType = this.determineParticipantType(to);

		const isFromAccount = fromType === TRANSFER.PARTICIPANT_TYPE.ACCOUNT;
		const isFromContract = isFromAccount ? false : fromType === TRANSFER.PARTICIPANT_TYPE.CONTRACT;
		const isToAccount = toType === TRANSFER.PARTICIPANT_TYPE.ACCOUNT;
		const isToContract = isToAccount ? false : toType === TRANSFER.PARTICIPANT_TYPE.CONTRACT;

		if (isFromAccount && isToAccount) return TRANSFER.TYPE.ACCOUNT_TO_ACCOUNT;
		if (isFromAccount && isToContract) return TRANSFER.TYPE.ACCOUNT_TO_CONTRACT;
		if (isFromContract && isToContract) return TRANSFER.TYPE.CONTRACT_TO_CONTRACT;
		if (isFromContract && isToContract) return TRANSFER.TYPE.CONTRACT_TO_ACCOUNT;

		throw new InternalError(ERROR.UNKNOWN_TRANSFER_TYPE);
	}

	getReceiver(transfer: ITransferExtended, receiverType = this.getReceiverType(transfer.relationType)) {
		switch (receiverType) {
			case TRANSFER.PARTICIPANT_TYPE.ACCOUNT:
				return transfer._fromAccount;
			case TRANSFER.PARTICIPANT_TYPE.CONTRACT:
				return transfer._fromContract;
			default:
				throw new InternalError(ERROR.UNKNOWN_RECEIVER_TYPE);
		}
	}

	getSender(transfer: ITransferExtended, senderType = this.getSenderType(transfer.relationType)) {
		switch (senderType) {
			case TRANSFER.PARTICIPANT_TYPE.ACCOUNT:
				return transfer._toAccount;
			case TRANSFER.PARTICIPANT_TYPE.CONTRACT:
				return transfer._toContract;
			default:
				throw new InternalError(ERROR.UNKNOWN_RECEIVER_TYPE);
		}
	}

	getSenderType(relationType: ITransfer['relationType']) {
		switch (relationType) {
			case TRANSFER.TYPE.ACCOUNT_TO_ACCOUNT:
			case TRANSFER.TYPE.ACCOUNT_TO_CONTRACT:
				return TRANSFER.PARTICIPANT_TYPE.ACCOUNT;
			case TRANSFER.TYPE.CONTRACT_TO_CONTRACT:
			case TRANSFER.TYPE.CONTRACT_TO_ACCOUNT:
				return TRANSFER.PARTICIPANT_TYPE.CONTRACT;
		}
	}

	getReceiverType(relationType: ITransfer['relationType']) {
		switch (relationType) {
			case TRANSFER.TYPE.ACCOUNT_TO_ACCOUNT:
			case TRANSFER.TYPE.CONTRACT_TO_ACCOUNT:
				return TRANSFER.PARTICIPANT_TYPE.ACCOUNT;
			case TRANSFER.TYPE.ACCOUNT_TO_CONTRACT:
			case TRANSFER.TYPE.CONTRACT_TO_CONTRACT:
				return TRANSFER.PARTICIPANT_TYPE.CONTRACT;
		}
	}

	getTypesOfParticipants(type: TRANSFER.TYPE) {
		switch (type) {
			case TRANSFER.TYPE.ACCOUNT_TO_ACCOUNT:
				return [TRANSFER.PARTICIPANT_TYPE.ACCOUNT, TRANSFER.PARTICIPANT_TYPE.ACCOUNT];
			case TRANSFER.TYPE.ACCOUNT_TO_CONTRACT:
				return [TRANSFER.PARTICIPANT_TYPE.ACCOUNT, TRANSFER.PARTICIPANT_TYPE.CONTRACT];
			case TRANSFER.TYPE.CONTRACT_TO_CONTRACT:
				return [TRANSFER.PARTICIPANT_TYPE.CONTRACT, TRANSFER.PARTICIPANT_TYPE.CONTRACT];
			case TRANSFER.TYPE.CONTRACT_TO_ACCOUNT:
				return [TRANSFER.PARTICIPANT_TYPE.CONTRACT, TRANSFER.TYPE.ACCOUNT_TO_ACCOUNT];
		}
	}

	determineParticipantType(participant: AccountId | ContractId) {
		switch (true) {
			case isAccountId(participant): return TRANSFER.PARTICIPANT_TYPE.ACCOUNT;
			case isContractId(participant): return TRANSFER.PARTICIPANT_TYPE.CONTRACT;
			default: throw new ProcessingError(ERROR.UNKNOWN_PARTICIPANT_TYPE);
		}
	}

	async setParticipants(
		dFrom: AccountOrContractDoc,
		dTo: AccountOrContractDoc,
		transfer: Overwrite<ITransfer, { relationType?: TRANSFER.TYPE }>,
		type: TRANSFER.TYPE,
	) {
		switch (type) {
			case TRANSFER.TYPE.ACCOUNT_TO_ACCOUNT:
				transfer._fromAccount = dFrom;
				transfer._toAccount = dTo;
				break;
			case TRANSFER.TYPE.ACCOUNT_TO_CONTRACT:
				transfer._fromAccount = dFrom;
				transfer._toContract = dTo;
				break;
			case TRANSFER.TYPE.CONTRACT_TO_CONTRACT:
				transfer._fromContract = dFrom;
				transfer._toContract = dTo;
				break;
			case TRANSFER.TYPE.CONTRACT_TO_ACCOUNT:
				transfer._fromContract = dFrom;
				transfer._toContract = dTo;
				break;
		}
	}

	async createAndEmit(transfer: ITransfer, dFrom?: AccountOrContractDoc, dTo?: AccountOrContractDoc) {
		const isFromSet = !!transfer._fromAccount || !!transfer._fromContract;
		const isToSet = !!transfer._toAccount || !!transfer._toContract;
		if (!isFromSet && !isToSet) {
			assert(!dFrom, 'dFrom is required');
			assert(!dTo, 'dTo is required');
			this.setParticipants(
				dFrom, dTo, transfer,
				transfer.relationType || this.determineRelationType(dFrom.id, dTo.id),
			);
		} else assert(isFromSet && isToSet, ERROR.CAN_NOT_DETERMINE_PARTICIPANTS);
		const dTransfer = await super.create(transfer);
		this.redisConnection.emit(REDIS.EVENT.NEW_TRANSFER, dTransfer);
		return dTransfer;
	}

}
