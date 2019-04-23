import AbstractModel, { createSchema } from './abstract.model';
import * as MODEL from '../constants/model.constants';
import { IAsset, IAssetPrice, IAssetBitasset } from '../interfaces/IAsset';
import { Schema } from 'mongoose';

const assetPriceSchema = createSchema<IAssetPrice>({
	base: {
		amount: Number,
		asset_id: String,
	},
	quote: {
		amount: Number,
		asset_id: String,
	},
});

const bitassetSchema = createSchema<IAssetBitasset>({
	id: String,
	current_feed_publication_time: String,
	force_settled_volume: Number,
	settlement_fund: Number,
	feeds: [Schema.Types.Mixed],
	is_prediction_market: Boolean,
	options: {
		short_backing_asset: String,
		maximum_force_settlement_volume: Number,
		force_settlement_offset_percent: Number,
		force_settlement_delay_sec: Number,
		feed_lifetime_sec: Number,
		minimum_feeds: Number,
		extensions: [Schema.Types.Mixed],
	},
	current_feed: {
		maintenance_collateral_ratio: Number,
		maximum_short_squeeze_ratio: Number,
		settlement_price: assetPriceSchema,
		core_exchange_rate: assetPriceSchema,
	},
	settlement_price: assetPriceSchema,
});

export default AbstractModel<IAsset>(MODEL.NAME.ASSET, {
	id: String,
	_account: { ref: MODEL.NAME.ACCOUNT, type: Schema.Types.ObjectId },

	symbol: String,
	// bitasset_data_id: String,
	// dynamic_asset_data_id: String,
	precision: Number,
	options: {
		flags: Number,
		issuer_permissions: Number,
		market_fee_percent: Number,
		max_market_fee: Number,
		max_supply: String,
		description: String,
		extensions: [Schema.Types.Mixed],
		whitelist_authorities: [Schema.Types.Mixed],
		blacklist_authorities: [Schema.Types.Mixed],
		whitelist_markets: [Schema.Types.Mixed],
		blacklist_markets: [Schema.Types.Mixed],
		core_exchange_rate: assetPriceSchema,
	},
	bitasset: bitassetSchema,
	// dynamic: {
	// 	id: String,
	// 	current_supply: Number,
	// 	confidential_supply: Number,
	// 	accumulated_fees: Number,
	// 	fee_pool: Number,
	// },
});
