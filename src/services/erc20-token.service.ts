import ERC20TokenRepository from '../repositories/erc20-token.repository';
import ProcessingError from '../errors/processing.error';

export const ERROR = {
	ERC20_TOKEN_NOT_FOUND: 'sidechain erc20 token not found',
};

export default class ERC20TokenService {

	constructor(
		readonly erc20TokenRepository: ERC20TokenRepository,
	) {}

	async getTokenByETHAddress(ethAdrress: string) {
		const dToken = await this.erc20TokenRepository.findOne({
			eth_addr: ethAdrress,
		});
		if (!dToken) throw new ProcessingError(ERROR.ERC20_TOKEN_NOT_FOUND);
		return dToken;
	}
}
