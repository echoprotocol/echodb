import BlockRepository from '../repositories/block.repository';
import ProcessingError from '../errors/processing.error';
import { IBlock } from '../interfaces/IBlock';
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


	calculateDelegationRate(blocks: Array<IBlock>) {
		const blocksCount = blocks.length;
		const blocksWithDelegateProduser = blocks.filter((b) => b.delegate !== ZERO_ACCOUNT).length;
		const delegatePercent = (blocksWithDelegateProduser / blocksCount) * 100;
		return delegatePercent;
	}

	async getDelegationRate(opts?: delegateCalcOpts) {
		const blocks = await this.blockRepository.find({});
		const delegatePercent = this.calculateDelegationRate(blocks);
		if (opts) {
			const startDate = Number(opts.startDate);
			const endDate = Number(opts.endDate);
			const interval = Number(opts.interval);
			if (endDate <= startDate) {
				throw new Error('Start date is bigger then end date');
			}
			if (endDate - startDate < interval) {
				throw new Error('The choosen period is smaller then interval');
			}
			const newMap: Map<number, Array<IBlock>> = new Map();
			const orderedBlocks = blocks.filter((block) => {
				const blockTimestamp = Date.parse(block.timestamp) / 1000
				return (blockTimestamp >= startDate) && (blockTimestamp <= endDate);
			}).reduce((acc: Map<number, Array<IBlock>>, val: IBlock) => {
				const timestamp = Date.parse(val.timestamp) / 1000;
				const segmentNumber = Math.ceil((timestamp - startDate) / interval);
				return acc.set(segmentNumber, acc.get(segmentNumber) ? [...acc.get(segmentNumber), val] : [val]);
			}, newMap);

			const ratesMap: Map<string, number> = new Map();
			for(const blocks of orderedBlocks) {
				const rate = this.calculateDelegationRate(blocks[1]);
				const startIntervalDate = startDate + (interval * (blocks[0] - 1));
				const startIntarelDateString = new Date(startIntervalDate * 1000).toISOString();
				ratesMap.set(startIntarelDateString, rate)
			}
			return {
				delegatePercent,
				ratesMap,
			};
		}
		return delegatePercent;
	}
}
