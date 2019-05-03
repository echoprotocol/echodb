import ProcessingError from '../errors/processing.error';
import AssetRepository from '../repositories/asset.repository';
import AccountRepository from '../repositories/account.repository';
import { MongoId } from '../types/mongoose';

export const ERROR = {
	ASSET_NOT_FOUND: 'asset not found',
};

type GetAssetsQuery = { symbol?: object, id?: object, _account?: MongoId };

export default class AssetService {

	constructor(
		private assetRepository: AssetRepository,
		private accountRepository: AccountRepository,
	) {}

	async getAsset(id?: string, symbol?: string) {
		let dAsset;
		if (id) dAsset = await this.assetRepository.findById(id);
		else if (symbol) dAsset = await this.assetRepository.findOne({ symbol });
		if (!dAsset) throw new ProcessingError(ERROR.ASSET_NOT_FOUND);
		return dAsset;
	}

	async getAssets(
			count: number,
			offset: number,
			{ symbols, assets, account }: { symbols?: string[], assets?: string[], account?: string } = {},
		) {
		const query: GetAssetsQuery = {};
		if (symbols) query.symbol = { $in: symbols };
		if (assets) query.id = { $in: assets };
		if (account) {
			query._account = await this.accountRepository.findById(account);
		}
		const [items, total] = await Promise.all([
			this.assetRepository.find(
				query,
				null,
				{ limit: count, skip: offset },
			),
			this.assetRepository.count(query),
		]);
		return { items, total };
	}

}
