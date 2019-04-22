import RedisConnection from '../../../connections/redis.connection';
import AbstractOperation from './abstract.operation';
import EchoService from '../../../services/echo.service';
import AssetRepository from '../../../repositories/asset.repository';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_BITASSET_UPDATE;

export default class AssetBitassetUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_BITASSET_UPDATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly assetRepository: AssetRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		const dAsset = await this.assetRepository.findById(body.asset_to_update);
		if (body.new_options) dAsset.bitasset.options = body.new_options;
		await dAsset.save();
		this.redisConnection.emit(REDIS.EVENT.ASSET_UPDATED, body.asset_to_update);
		return this.validateRelation({
			from: [body.issuer],
			assets: [body.fee.asset_id, body.asset_to_update],
		});
	}

}
