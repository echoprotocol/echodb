import BN from 'bignumber.js';
import BlockRepository from '../repositories/block.repository';
import BalanceRepository from '../repositories/balance.repository';
import AssetRepository from '../repositories/asset.repository';
import ProcessingError from '../errors/processing.error';
import { BlockWithInjectedVirtualOperations } from '../interfaces/IBlock';
import { DECENTRALIZATION_RATE_BLOCK_COUNT } from '../constants/block.constants';
import { CORE_ASSET } from '../constants/echo.constants';
import { TYPE } from '../constants/balance.constants';
import { removeDuplicates } from '../utils/common';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block not found',
};

export default class BlockService {

	constructor(
		readonly blockRepository: BlockRepository,
		readonly balanceRepository: BalanceRepository,
		readonly assetRepository: AssetRepository,
	) {}

	async getCurrentDecentralizationRate() {
		const dBlocks = await this.blockRepository.find({}, {}, { sort: { round: -1 }, limit: 1 });
		if (!dBlocks[0]) {
			throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		}

		return dBlocks[0].decentralization_rate;
	}

	async getDecentralizationRateFromBlock(block: BlockWithInjectedVirtualOperations) {
		const baseBlockOffset = block.round - DECENTRALIZATION_RATE_BLOCK_COUNT
		const blockOffset = baseBlockOffset > 0 ? baseBlockOffset : 0;
		const decentralizationRateCalculatinBlocks = await this.getBlocks(DECENTRALIZATION_RATE_BLOCK_COUNT, blockOffset);
		const accountProducerIds = decentralizationRateCalculatinBlocks.items.map(({ account }) => account);
		const accountProducersCount = removeDuplicates(accountProducerIds).length;
		const baseAsset = await this.assetRepository.findById(CORE_ASSET);

		if (!baseAsset) {
			return 100;
		};

		const query = {
			amount: { $ne: '0' },
			_account: { $exists: true },
			_contract: { $exists: false },
			_asset: baseAsset._id,
			type: TYPE.ASSET,
		};
		const notZeroBalancesCount = await this.balanceRepository.count(query);

		if (notZeroBalancesCount === 0) {
			return 100;
		};

		const decentralizationRate = new BN(accountProducersCount).div(notZeroBalancesCount).times(100).integerValue(BN.ROUND_CEIL).toNumber()
		return decentralizationRate > 100 ? 100 : decentralizationRate;
	}

	async updateBlockAfterParsing(block: BlockWithInjectedVirtualOperations) {
		const dBlock = await this.getBlock(block.round);
		
		const [
			decentralizationRate,
		] = await Promise.all([
			this.getDecentralizationRateFromBlock(block)
		]);

		dBlock.decentralization_rate = decentralizationRate;

		await dBlock.save();

		return dBlock;
	}

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

}
