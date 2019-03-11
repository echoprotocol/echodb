import BlockRepository from './../repositories/block.repository';

import * as API from '../constants/api.constants';

export default class BlockService {

	constructor(
		readonly blockRepository: BlockRepository,
	) {}

	async getBlock(id: string) {
		return this.blockRepository.findById(id);
	}

	async getBlocks(count: number = API.PAGINATION.DEFAULT_COUNT, offset: number = 0) {
		if (count > API.PAGINATION.MAX_COUNT) {
			count = API.PAGINATION.MAX_COUNT;
		}

		return this.blockRepository.find({} , null, {
			skip: offset,
			limit: count,
		});
	}

}
