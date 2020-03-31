import BlockRepository from '../repositories/block.repository';
import ProcessingError from '../errors/processing.error';
import { BlockWithInjectedVirtualOperations } from 'interfaces/IBlock';

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

	async createModifiedBlock(block: BlockWithInjectedVirtualOperations) {
		const dayMs = 24 * 60 * 60 * 1000;
		const currentDate = new Date(block.timestamp);
		const yesterdayDate = new Date(Date.parse(currentDate.toISOString()) - dayMs).toISOString();
		const blocksPer24Hours = await this.blockRepository.count({ timestamp: { $gt: yesterdayDate, $lt: currentDate } });
		const averageBlockTime = dayMs / blocksPer24Hours;

		return this.blockRepository.create({
			...block,
			average_block_time: averageBlockTime,
		});
	}
}
