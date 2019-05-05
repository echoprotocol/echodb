import AccountRepository from '../repositories/account.repository';
import BalanceRepository from '../repositories/balance.repository';
import ContractRepository from '../repositories/contract.repository';
import EchoRepository from '../repositories/echo.repository';
import TransferRepository from '../repositories/transfer.repository';
import TransferService from './transfer.service';
import ContractBalanceRepository from '../repositories/contract.balance.repository';
import ProcessingError from '../errors/processing.error';
import * as BALANCE from '../constants/balance.constants';
import * as CONTRACT from '../constants/contract.constants';
import * as ERC20 from '../constants/erc20.constants';
import * as TOKEN from '../constants/token.constants';
import * as TRANSFER from '../constants/transfer.constants';
import { AccountId, ContractId } from '../types/echo';
import { IContract, ITokenInfo } from '../interfaces/IContract';
import { IOperationRelation } from '../interfaces/IOperation';
import { SomeOfAny } from '../types/some.of.d';
import { escapeRegExp } from '../utils/format';
import { ContractResult } from 'echojs-lib';
import { TDoc, MongoId } from '../types/mongoose';
import { decode } from 'echojs-contract';
import { IAccount } from '../interfaces/IAccount';

type GetContractsQuery = { registrar?: object, type?: CONTRACT.TYPE };
type GetTokensQuery = { _registrar?: any, type?: any, token_info?: SomeOfAny<ITokenInfo> };

interface GetTokensParameters {
	registrar?: AccountId;
	name?: string;
	symbol?: string;
	type?: TOKEN.TYPE;
}
export const ERROR = {
	ACCOUNT_NOT_FOUND: 'account not found',
	CONTRACT_NOT_FOUND: 'contract not found',
};

export default class ContractService {

	constructor(
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractRepository: ContractRepository,
		private contractBalanceRepository: ContractBalanceRepository,
		private echoRepository: EchoRepository,
		private transferRepository: TransferRepository,
		private transferService: TransferService,
	) { }

	getTypeByCode(bytecode: string): CONTRACT.TYPE {
		if (this.isERC20Code(bytecode)) return CONTRACT.TYPE.ERC20;
		return CONTRACT.TYPE.COMMON;
	}

	isERC20Code(bytecode: string): boolean {
		for (const hash of Object.values(ERC20.METHOD.HASH_LIST)) {
			if (!bytecode.includes(hash)) return false;
		}
		return true;
	}

	async getContract(id: string) {
		const dContract = await this.contractRepository.findById(id);
		if (!dContract) throw new ProcessingError(ERROR.CONTRACT_NOT_FOUND);
		return dContract;
	}

	async getContracts(
		count: number,
		offset: number,
		{ registrars, type }: { registrars?: string[], type?: CONTRACT.TYPE } = {},
	) {
		const query: GetContractsQuery = {};
		if (registrars) query.registrar = { $in: registrars };
		if (type) query.type = type;
		const [items, total] = await Promise.all([
			this.contractRepository.find(query, null, { limit: count, skip: offset }),
			this.contractRepository.count(query),
		]);
		return { items, total };
	}

	// FIXME: refactor
	async getTokens(
		count: number,
		offset: number,
		{ registrar, type, name, symbol }: GetTokensParameters,
	) {
		const query: GetTokensQuery = {};
		const tokenInfo: SomeOfAny<ITokenInfo> = {};
		if (registrar) {
			const dAccount = await this.accountRepository.findById(registrar);
			if (!dAccount) throw new ProcessingError(ERROR.ACCOUNT_NOT_FOUND);
			query._registrar = dAccount;
		}
		if (type) query.type = type;
		else query.type = { $in: Object.values(TOKEN.TYPE) };
		if (symbol) tokenInfo.symbol = symbol;
		// TODO: limit regex abilities
		if (name) tokenInfo.name = new RegExp(escapeRegExp(name), 'i');
		for (const key of Object.keys(tokenInfo)) {
			// @ts-ignore
			query[`token_info.${key}`] = tokenInfo[key];
		}
		const [items, total] = await Promise.all([
			this.contractRepository.find(query, null, {
				limit: count,
				skip: offset,
			}),
			this.contractRepository.count(query),
		]);
		return { items, total };
	}

	async handleErc20Logs(
		dContract: TDoc<IContract>,
		contractResult: ContractResult,
	): Promise<Partial<IOperationRelation>> {
		const { tr_receipt: { log: logs } } = contractResult;

		const relations: Partial<IOperationRelation> = {
			from: [],
			to: [],
			assets: [],
			accounts: [],
			tokens: [],
		};
		for (const record of logs) {
			if (!ContractService.isLogRecord(record)) continue;
			const [eventHash, ...params] = record.log;
			if (!ERC20.EVENT_HASH_LIST.includes(eventHash)) continue;
			switch (eventHash) {
				case ERC20.EVENT_HASH.TRANSFER:
					const [from, to, amount] = [params[0], params[1], record.data].map((hex, index) => {
						return <string>decode(hex, [ERC20.EVENT_RESULT[ERC20.EVENT_NAME.TRANSFER][index]]);
					});
					relations.from.push(from);
					relations.to.push(to);
					await this.handleTokenTransfer(dContract, from, to, amount);
			}
		}

		return relations;
	}

	static isLogRecord(value: unknown): value is { log: string[]; data: string; } {
		if (!(value instanceof Object)) return false;
		if (!value.hasOwnProperty('data')) return false;
		if (!value.hasOwnProperty('log') || !Array.isArray((<{ log: string[] }>value).log)) return false;
		return true;
	}

	async handleTokenTransfer(
		dContract: TDoc<IContract>,
		from: AccountId | ContractId,
		to: AccountId | ContractId,
		amount: string | number,
	) {
		const senderType = this.transferRepository.determineParticipantType(from);
		const receiverType = this.transferRepository.determineParticipantType(to);
		const [dFrom, dTo, fromAmount, toAmount] = await Promise.all([
			this.transferService.fetchParticipant(from, senderType),
			this.transferService.fetchParticipant(to, receiverType),
			this.echoRepository.getAccountTokenBalance(dContract.id, from),
			this.echoRepository.getAccountTokenBalance(dContract.id, to),
		]);
		await Promise.all([
			this.transferRepository.createAndEmit({
				relationType: this.transferRepository.determineRelationType(from, to),
				amount: amount.toString(),
				_contract: dContract,
				valueType: BALANCE.TYPE.TOKEN,
			}),
			(async () => {
				if (dContract.problem) return;
				const sFromAmount = fromAmount.toString();
				const sToAmount = toAmount.toString();
				if (sFromAmount === '' || sToAmount === '') {
					dContract.problem = true;
					await dContract.save();
					return;
				}
				await Promise.all([
					this.updateOrCreateToken(
						senderType,
						dFrom,
						dContract,
						sFromAmount,
					),
					this.updateOrCreateToken(
						receiverType,
						dTo,
						dContract,
						sToAmount,
					),
				]);
			})(),
		]);
	}

	async updateOrCreateToken(
		type: TRANSFER.PARTICIPANT_TYPE,
		dOwner: MongoId<IAccount | IContract>,
		dContract: MongoId<IContract>,
		amount: string,
	) {
		switch (type) {
			case TRANSFER.PARTICIPANT_TYPE.ACCOUNT:
				await this.balanceRepository.updateOrCreateByAccountAndContract(
					<MongoId<IAccount>>dOwner,
					dContract,
					amount,
				);
				break;
			case TRANSFER.PARTICIPANT_TYPE.CONTRACT:
				await this.contractBalanceRepository.updateOrCreateByOwnerAndContract(
					<MongoId<IContract>>dOwner,
					dContract,
					amount,
				);
				break;
		}
	}

}
