import EchoConnection from '../connections/echo.connection';
import * as ECHO from '../constants/echo.constants';
import * as ERC20 from '../constants/erc20.constants';
import { Block } from 'echojs-lib';
import { encode, decode } from 'echojs-contract';

export default class EchoRepository {

	constructor(readonly echoConnection: EchoConnection) {}

	async getBlock(blockNum: number): Promise<Block> {
		try {
			return await this.echoConnection.echo.api.getBlock(blockNum);
		} catch (error) {
			// TODO: raven
			throw error;
		}
	}

	async getLastBlockNum(): Promise<number> {
		try {
			const { last_irreversible_block_num: lastBlockNum } =
				await this.echoConnection.echo.api.getDynamicGlobalProperties();
			return lastBlockNum;
		} catch (error) {
			// TODO: raven here
			throw error;
		}
	}

	async getAccountTokenBalance(contractId: string, address: string) {
		const hexValue = await this.echoConnection.echo.api.callContractNoChangingState(
			contractId,
			address,
			ECHO.ASSET.ECHO,
			// FIXME: use constant
			ERC20.METHOD.HASH.BALANCE_OF + encode({ value: address, type: 'address' }),
		);
		return decode(hexValue, ERC20.METHOD.RESULT_TYPE.BALANCE_OF);
	}

	subscribeToBlockApply(cb: (block: Block) => void) {
		this.echoConnection.echo.subscriber.setBlockApplySubscribe(cb);
	}

	getContractResult(resultId: string) {
		return this.echoConnection.echo.api.getContractResult(resultId);
	}

}
