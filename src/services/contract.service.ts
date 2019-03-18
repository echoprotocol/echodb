import * as CONTRACT from '../constants/contract.constants';
import * as ERC20 from '../constants/erc20.constants';

export default class ContractService {
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
}
