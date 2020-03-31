import BlockRepository from '../repositories/block.repository';
import ProcessingError from '../errors/processing.error';
import { historyBlocksAndOpsCountOpts } from 'interfaces/IHistoryOptions';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
};

export default class BlockService {

	constructor(
		readonly blockRepository: BlockRepository,
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

	async getBlocksCount(historyOpts: historyBlocksAndOpsCountOpts) {
		const from = new Date(historyOpts.from).toISOString();
		const to = historyOpts.to ? new Date(historyOpts.to) : new Date();
		const blocksCount = await this.blockRepository.count({ timestamp: { $gte: from, $lte: to } });
		return blocksCount;
	}

}
