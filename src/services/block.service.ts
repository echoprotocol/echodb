import BlockRepository from '../repositories/block.repository';
import ProcessingError from '../errors/processing.error';
import { historyBlocksAndOpsCountOpts } from 'interfaces/IHistoryOptions';
// import OperationRepository from '../repositories/operation.repository';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
};



export default class BlockService {

	constructor(
		readonly blockRepository: BlockRepository,
		// readonly operationRepositry: OperationRepository,
	) {}

	async getBlock(round: number) {
		const dBlock = await this.blockRepository.findOne({ round });
		if (!dBlock) throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		return dBlock;
	}

	async getBlocks(count: number, offset: number) {
		const [items, total] = await Promise.all([
			this.blockRepository.find({} , null, {
				skip: offset,
				limit: count,
			}),
			this.blockRepository.count({}),
		]);
		return { total, items };
	}

	async getBlocksAndOpsCount(historyOpts: historyBlocksAndOpsCountOpts) {
		const from = new Date(historyOpts.from);
		const to = historyOpts.to ? new Date(historyOpts.to) : new Date();
		console.log(from)
		console.log(to)
		// const a = await this.blockRepository.find({ });
		// console.log(a)
		const b = await this.blockRepository.find({ timestamp: { $lte: to, $gt: from } });
		console.log(b)
		const blocksCount = await this.blockRepository.count({ timestamp: { $gte: from, $lte: to } });
		console.log(blocksCount)
		return blocksCount;
	}

}
