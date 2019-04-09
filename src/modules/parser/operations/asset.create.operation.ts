import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import RedisConnection from 'connections/redis.connection';
import EchoService from '../../../services/echo.service';
import EchoRepository from '../../../repositories/echo.repository';
import * as REDIS from '../../../constants/redis.constants';
import * as ECHO from '../../../constants/echo.constants';
import BigNumber from 'bignumber.js';

type OP_ID = ECHO.OPERATION_ID.ASSET_CREATE;

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
		const [assetDynamicId, [dAccount]] = await Promise.all([
			this.echoRepository.getAssetDynamicDataId(result),
			this.echoService.checkAccounts([body.issuer]),
		]);

		const dAsset = await this.assetRepository.create({
			id: result,
			_account: dAccount,
			symbol: body.symbol,
			precision: body.precision,
			options: body.common_options,
			bitasset: body.common_options.flags ? body.bitasset_opts : null,
			dynamic: {
				id: assetDynamicId,
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
