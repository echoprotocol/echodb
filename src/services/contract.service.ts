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
import { escapeRegExp, dateFromUtcIso, ethAddrToEchoId } from '../utils/format';
import { ContractResult, decode, validators } from 'echojs-lib';
import { TDoc, MongoId } from '../types/mongoose';
import { IAccount } from '../interfaces/IAccount';
import { IBlock } from '../interfaces/IBlock';
import ContractCallerRepository from '../repositories/contract.caller.repository';
import { NAME as ModelName } from '../constants/model.constants';
import { IAmount } from 'constants/echo.constants';

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

const ZERO_ACCOUNT = '1.2.0';

export default class ContractService {

	constructor(
		private accountRepository: AccountRepository,
		private balanceRepository: BalanceRepository,
		private contractRepository: ContractRepository,
		private contractCallerRepository: ContractCallerRepository,
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
		for (const hash of Object.values(ERC20.METHOD.REQUIRED_HASH_LIST)) {
			if (!bytecode.includes(hash)) return false;
		}
		return true;
	}

	async getContract(id: string) {
		const dContract = await this.contractRepository.findById(id);
		if (!dContract) throw new ProcessingError(ERROR.CONTRACT_NOT_FOUND);
		return dContract;
	}

	async getCallers(contract: MongoId<IContract>): Promise<{
		contracts: TDoc<IContract>[],
		accounts: TDoc<IAccount>[],
	}> {
		const callers = await this.contractCallerRepository.find({ contract });
		const contracts: TDoc<IContract>[] = [];
		const accounts: TDoc<IAccount>[] = [];
		await Promise.all(callers.map(async ({ callerModel, caller }) => {
			if (callerModel === ModelName.CONTRACT) {
				contracts.push(await this.contractRepository.findOne({ _id: caller }));
			} else {
				accounts.push(await this.accountRepository.findOne({ _id: caller }));
			}
		}));
		return { contracts, accounts };
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
		return { total, items };
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
		dBlock: TDoc<IBlock>,
		trxInBlock: number,
		opInTrx: number,
		virtual: boolean,
		fee: IAmount,
		operationId: number,
	): Promise<Partial<IOperationRelation>> {
		const { tr_receipt: { log: logs } } = contractResult;

		const relations: Partial<IOperationRelation> = {
			from: [],
			to: [],
			assets: [],
			accounts: [],
			tokens: [],
		};
		const contractsMap: { [id: string]: TDoc<IContract> } = { [dContract.id]: dContract };
		for (const record of logs) {
			if (!ContractService.isLogRecord(record)) continue;
			const { address } = record;
			const contract = contractsMap[address]
				|| (contractsMap[address] = await this.contractRepository.findById(ethAddrToEchoId(address)));
			const [eventHash, ...params] = record.log;
			if (!ERC20.EVENT_HASH_LIST.includes(eventHash)) continue;
			switch (eventHash) {
				case ERC20.EVENT_HASH.TRANSFER:
					const [from, to, amount] = [params[0], params[1], record.data].map((hex, index) => {
						return <string>decode(hex, [ERC20.EVENT_RESULT[ERC20.EVENT_NAME.TRANSFER][index]]);
					});
					relations.from.push(from);
					relations.to.push(to);
					await this.handleTokenTransfer(
						contract,
						from,
						to,
						amount,
						dBlock,
						trxInBlock,
						opInTrx,
						virtual,
						fee,
						operationId,
					);
			}
		}

		return relations;
	}

	static isLogRecord(value: unknown): value is { log: string[]; data: string; address: string } {
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
		dBlock: TDoc<IBlock>,
		trxInBlock: number,
		opInTrx: number,
		virtual: boolean,
		fee: IAmount,
		operationId: number,
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
			this.transferRepository.createAndEmit(
				{
					virtual,
					fee,
					operationId,
					relationType: this.transferRepository.determineRelationType(from, to),
					amount: amount.toString(),
					_contract: dContract,
					valueType: BALANCE.TYPE.TOKEN,
					timestamp: dateFromUtcIso(dBlock.timestamp),
					block: dBlock.round,
					trx_in_block: trxInBlock,
					op_in_trx: opInTrx,
				},
				dFrom,
				dTo,
			),
			(async () => {
				if (dContract.problem) return;
				const sFromAmount = fromAmount.toString();
				const sToAmount = toAmount.toString();
				if ((sFromAmount === '' && from !== ZERO_ACCOUNT) || (sToAmount === '' && to !== ZERO_ACCOUNT)) {
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
		dContract.token_info && (dContract.token_info.transactions_count += 1);
		await dContract.save();
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

	private async getCaller(callerId: string): Promise<TDoc<IContract> | TDoc<IAccount> | null> {
		let result: TDoc<IContract> | TDoc<IAccount>;
		if (validators.isContractId(callerId)) result = await this.contractRepository.findById(callerId);
		else if (validators.isAccountId(callerId)) result = await this.accountRepository.findById(callerId);
		else throw new Error(`invalid contract caller id format ${callerId}`);
		return result;
	}

	async updateContractCaller(dContract: TDoc<IContract>, callerId: string) {
		const callerDocument = await this.getCaller(callerId);
		if (!callerDocument) throw new Error(`caller ${callerId} not found`);
		const caller = await this.contractCallerRepository.findOne({ contract: dContract, caller: callerDocument });
		if (caller) return;
		await this.contractCallerRepository.create({
			caller: callerDocument,
			callerModel: validators.isContractId(callerId) ? ModelName.CONTRACT : ModelName.ACCOUNT,
			contract: dContract,
		});
	}

}
