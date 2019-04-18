import ContractRepository from '../repositories/contract.repository';
import AccountRepository from '../repositories/account.repository';
import ProcessingError from '../errors/processing.error';
import * as CONTRACT from '../constants/contract.constants';
import * as ERC20 from '../constants/erc20.constants';
import * as TOKEN from '../constants/token.constants';
import { AccountId } from '../types/echo';
import { ITokenInfo } from '../interfaces/IContract';
import { SomeOfAny } from '../types/some.of.d';
import { escapeRegExp } from '../utils/format';

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
		readonly contractRepository: ContractRepository,
		readonly accountRepository: AccountRepository,
	) {}

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

}
