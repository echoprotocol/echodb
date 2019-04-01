import ContractRepository from '../repositories/contract.repository';
import ProcessingError from '../errors/processing.error';
import * as CONTRACT from '../constants/contract.constants';
import * as ERC20 from '../constants/erc20.constants';

type GetContractsQuery = { registrar?: object, type?: CONTRACT.TYPE };

export const ERROR = {
	CONTRACT_NOT_FOUND: 'not found',
};

export default class ContractService {

	constructor(
		readonly contractRepository: ContractRepository,
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

}
