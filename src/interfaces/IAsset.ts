import { Document } from 'mongoose';
import { MongoId } from '../types/mongoose';

export interface IAssetPrice {
	base: {
		amount: number;
		asset_id: string;
	};
	quote: {
		amount: number;
		asset_id: string;
	};
}

export interface IAssetBitasset {
	id: string;
	current_feed_publication_time: string;
	force_settled_volume: number;
	settlement_fund: number;
	feeds: unknown[];
	is_prediction_market: boolean;
	options: {
		short_backing_asset: string;
		maximum_force_settlement_volume: number;
		force_settlement_offset_percent: number;
		force_settlement_delay_sec: number;
		feed_lifetime_sec: number;
		minimum_feeds: number;
		extensions: unknown[];
	};
	current_feed: {
		maintenance_collateral_ratio: number;
		maximum_short_squeeze_ratio: number;
		settlement_price: IAssetPrice;
		core_exchange_rate: IAssetPrice;
	};
	settlement_price: IAssetPrice;
}

export interface IAsset {
	id: string;
	_account: MongoId;
	symbol: string;
	precision: number;
	options: {
		flags: number;
		issuer_permissions: number;
		market_fee_percent: number;
		max_market_fee: string;
		max_supply: string;
		description: string;
		extensions: unknown[];
		whitelist_authorities: unknown[];
		blacklist_authorities: unknown[];
		whitelist_markets: unknown[];
		blacklist_markets: unknown[];
		core_exchange_rate: IAssetPrice;
	};
	bitasset: IAssetBitasset;
}

// @ts-ignore
export interface IAssetDocument extends IAsset, Document {}
