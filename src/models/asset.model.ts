import AbstractModel, { createSchema } from './abstract.model';
import * as MODEL from '../constants/model.constants';
import { IAsset, IAssetPrice, IAssetBitasset, IAssetDynamic } from '../interfaces/IAsset';
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
}, {
	_id: false,
});

const assetDynamicSchema = createSchema<IAssetDynamic>({
	id: String,
	current_supply: String,
	confidential_supply: String,
	accumulated_fees: String,
	fee_pool: String,
}, {
	_id: false,
});

const bitassetSchema = createSchema<IAssetBitasset>({
	id: String,
	current_feed_publication_time: Date,
	force_settled_volume: Number,
	feeds: [Schema.Types.Mixed],
	options: {
		short_backing_asset: String,
		feed_lifetime_sec: Number,
		minimum_feeds: Number,
	},
}, {
	_id: false,
});

export default AbstractModel<IAsset>(MODEL.NAME.ASSET, {
	id: String,
	_account: { ref: MODEL.NAME.ACCOUNT, type: Schema.Types.ObjectId },
	symbol: String,
	precision: Number,
	options: {
		flags: Number,
		issuer_permissions: Number,
		max_supply: String,
		description: String,
		whitelist_authorities: [Schema.Types.Mixed],
		blacklist_authorities: [Schema.Types.Mixed],
		core_exchange_rate: assetPriceSchema,
	},
	bitasset: bitassetSchema,
	bitasset_data_id: String,
	dynamic: assetDynamicSchema,
});
