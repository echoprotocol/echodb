import AbstractRepository from './abstract.repository';
import BlockModel from '../models/block.model';
import RavenHelper from '../helpers/raven.helper';
import { IBlock, BlockWithInjectedVirtualOperations } from '../interfaces/IBlock';

export default class BlockRepository extends AbstractRepository<IBlock> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, BlockModel);
	}

	findByRound(round: number) {
		return super.findOne({ round });
	}

	async createBlockWithAverageTime(block: BlockWithInjectedVirtualOperations) {
		const today = new Date();
		const dayMs = 24 * 60 * 60 * 1000;
		const yesterday = new Date(Date.parse(today.toString()) - dayMs);
		const blocksPer24Hours = await this.count({ timestamp: { $gt: yesterday } });
		const averageBlockTime = blocksPer24Hours / dayMs;

		return super.create({
			...block,
			average_block_time: averageBlockTime,
		});
	}
}
