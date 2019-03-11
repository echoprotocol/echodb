import EchoConnection from '../connections/echo.connection';
import { Block } from 'echojs-lib';

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
			console.log(error);
			// TODO: raven here
			throw error;
		}
	}

	subscribeToBlockApply(cb: (block: Block) => void) {
		this.echoConnection.echo.subscriber.setBlockApplySubscribe(cb);
	}

}
