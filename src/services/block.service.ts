import BlockRepository from '../repositories/block.repository';
import ProcessingError from '../errors/processing.error';
import { IBlock } from '../interfaces/IBlock';
import { ZERO_ACCOUNT } from '../constants/echo.constants';
import { historyDelegatePercentOpts } from 'interfaces/IHistoryOptions';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
	INVALID_DATES: 'Start date is bigger then end date',
	INVALID_INTERVAL: 'The choosen period is smaller then interval'
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


	private calculateDelegationRate(blocks: Array<IBlock>) {
		const blocksCount = blocks.length;
		const blocksWithDelegateProduser = blocks.filter((b) => b.delegate !== ZERO_ACCOUNT).length;
		const delegatePercent = (blocksWithDelegateProduser / blocksCount) * 100;
		return delegatePercent;
	}

	async getDelegationRate(historyOpts?: historyDelegatePercentOpts) {
		const blocks = await this.blockRepository.find({});
		const ratesMap: Map<string, number> = new Map();
		if (blocks.length === 0) {
			return { delegatePercent: 0 };
		}
		const delegatePercent = this.calculateDelegationRate(blocks);
		if (historyOpts) {
			const startDate = Date.parse(historyOpts.startDate) / 1000;
			const endDate = Date.parse(historyOpts.endDate) / 1000;
			const interval = Number(historyOpts.interval);
			if (endDate <= startDate) {
				throw new Error(ERROR.INVALID_DATES);
			}
			if (endDate - startDate < interval) {
				throw new Error(ERROR.INVALID_INTERVAL);
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

			for(const blocks of orderedBlocks) {
				const rate = this.calculateDelegationRate(blocks[1]);
				const startIntervalDate = startDate + (interval * (blocks[0] - 1));
				const startIntervalDateString = new Date(startIntervalDate * 1000).toISOString();
				ratesMap.set(startIntervalDateString, rate)
			}
		}
		return historyOpts ? {
			delegatePercent,
			ratesMap
		} : {
			delegatePercent,
		};
	}
}
