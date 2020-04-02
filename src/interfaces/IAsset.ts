import * as ECHO from '../constants/echo.constants';
import { MongoId, TDoc } from '../types/mongoose';
import { AssetId, BitassetDataId, BitassetId } from '../types/echo';
import { IAccount } from './IAccount';

export interface IAssetPrice {
	base: ECHO.IAmount;
	quote: ECHO.IAmount;
}

export interface IAssetDynamic {
	id: string;
	current_supply: string;
	confidential_supply: string;
	accumulated_fees: string;
	fee_pool: string;
}

export interface IAssetDefaultBitasset {
	force_settled_volume: number;
	feeds: unknown[];
}

export interface IAssetBitasset extends IAssetDefaultBitasset {
	id: BitassetId;
	current_feed_publication_time: Date;
	options: {
		short_backing_asset: string;
		feed_lifetime_sec: number;
		minimum_feeds: number;
	};
}

export interface IAsset {
	id: AssetId;
	_account: MongoId;
	symbol: string;
	precision: number;
	options: {
		flags: number;
		issuer_permissions: number;
		max_supply: string;
		description: string;
		whitelist_authorities: unknown[];
		blacklist_authorities: unknown[];
		core_exchange_rate: IAssetPrice;
	};
	bitasset?: IAssetBitasset;
	bitasset_data_id?: BitassetDataId;
	dynamic: IAssetDynamic;
}

export interface IAssetExtended extends IAsset {
	_account: TDoc<IAccount>;
}
