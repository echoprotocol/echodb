import { Block } from 'echojs-lib';
import { IBlock } from '../interfaces/IBlock';
import BlockRepository from 'repositories/block.repository';

export default class EchoService {

	constructor(
		readonly blockRepository: BlockRepository,
	) {}

	async parseBlock(block: Block) {
		await this.blockRepository.create(<IBlock>block);
	}

}
