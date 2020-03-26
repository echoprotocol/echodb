import BlockRepository from '../repositories/block.repository';
import ProcessingError from '../errors/processing.error';
import { IBlock } from 'interfaces/IBlock';
import { ZERO_ACCOUNT } from '../services/contract.service';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
};

interface delegateCalcOpts {
	startDate: number | string;
	endDate: number | string;
	interval: number | string;
}

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


	async calculateDelegationRate(blocks: Array<IBlock>) {
		const blocksCount = blocks.length;
		const blocksWithDelegateProduser = blocks.filter((b) => b.delegate !== ZERO_ACCOUNT).length;
		const delegatePercent = (blocksWithDelegateProduser / blocksCount) * 100;
		return delegatePercent;
	}

	async getDelegationRate(opts?: delegateCalcOpts) {
		const blocks = await this.blockRepository.find({});
		const delegatePercent = await this.calculateDelegationRate(blocks);
		const delegationRates = {
			totalDelegationRate: delegatePercent,
		};
		if (opts) {
			const filtered = blocks.filter((block) => {
				const blockTimestamp = Date.parse(block.timestamp) / 1000
				return blockTimestamp > Number(opts.startDate) && blockTimestamp < Number(opts.endDate)
			});

		}

		return delegationRates;
	}
}
