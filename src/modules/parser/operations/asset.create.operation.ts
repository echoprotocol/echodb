import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import RedisConnection from 'connections/redis.connection';
import EchoService from '../../../services/echo.service';
import EchoRepository from '../../../repositories/echo.repository';
import * as REDIS from '../../../constants/redis.constants';
import * as ECHO from '../../../constants/echo.constants';
import BigNumber from 'bignumber.js';
import { IAssetBitasset, IAssetDefaultBitasset } from 'interfaces/IAsset';

type OP_ID = ECHO.OPERATION_ID.ASSET_CREATE;

const bitAssetDefaultFields: IAssetDefaultBitasset = {
	current_feed: {
		settlement_price: {
			base: { amount: 0, asset_id: '1.3.0' },
			quote: { amount: 0, asset_id: '1.3.0' },
		},
		maintenance_collateral_ratio: 1750,
		maximum_short_squeeze_ratio: 1500,
		core_exchange_rate: {
			base: { amount: 0, asset_id: '1.3.0' },
			quote: { amount: 0, asset_id: '1.3.0' },
		},
	},
	settlement_price: {
		base: { amount: 0, asset_id: '1.3.0' },
		quote: { amount: 0, asset_id: '1.3.0' },
	},
	force_settled_volume: 0,
	feeds: [],
	settlement_fund: 0,
};

export default class AssetCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_CREATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly assetRepository: AssetRepository,
		readonly echoService: EchoService,
		readonly echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID], result: ECHO.OPERATION_RESULT[OP_ID]) {
		const [assetData, [dAccount]] = await Promise.all([
			this.echoRepository.getAsset(result),
			this.echoService.checkAccounts([body.issuer]),
		]);
		const bitasset: IAssetBitasset | null = body.common_options.flags ? {
			...bitAssetDefaultFields,
			id: assetData.bitasset.id,
			current_feed_publication_time: new Date(`${assetData.bitasset.current_feed_publication_time}+00:00`),
			is_prediction_market: body.is_prediction_market,
			options: body.bitasset_opts,
		} : null;
		const dAsset = await this.assetRepository.create({
			bitasset,
			id: result,
			_account: dAccount,
			symbol: body.symbol,
			precision: body.precision,
			options: body.common_options,
			bitasset_data_id: body.common_options.flags ? assetData.bitasset_data_id : null,
			dynamic: {
				id: assetData ? assetData.dynamic_asset_data_id : null,
				current_supply: '0',
				confidential_supply: '0',
				accumulated_fees: '0',
				fee_pool: new BigNumber(body.fee.amount).div(2).toString(), // FIXME: how to round it?
			},
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_ASSET, dAsset);
		return this.validateRelation({
			from: [body.issuer],
			assets: [result, body.fee.asset_id],
		});
	}
}
