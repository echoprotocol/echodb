import BlockRepository from '../repositories/block.repository';
import TransactionRepository from '../repositories/transaction.repository';
import ProcessingError from '../errors/processing.error';

export const ERROR = {
	BLOCK_NOT_FOUND: 'block_not_found',
};

export default class TransactionService {

	constructor(
		readonly blockRepository: BlockRepository,
		readonly transactionRepository: TransactionRepository,
	) {}

	async getTransactionsByBlock(block: number) {
		const dBlock = await this.blockRepository.findByRound(block);
		if (!dBlock) throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		return this.transactionRepository.findByBlockMongoId(dBlock);
	}

	async getTransactionsByBlockAndPosition(block: number, trxInBlock: number) {
		const dBlock = await this.blockRepository.findByRound(block);
		if (!dBlock) throw new ProcessingError(ERROR.BLOCK_NOT_FOUND);
		return this.transactionRepository.findOne({
			_block: dBlock._id,
			trx_index: trxInBlock,
		});
	}

	async getTransactionByHex(trx_hex: string) {
		return this.transactionRepository.findByTrxDigest(trx_hex);
	}
}
