import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import RedisConnection from 'connections/redis.connection';
import EchoService from '../../../services/echo.service';
import * as REDIS from '../../../constants/redis.constants';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_CREATE;

export default class AssetCreateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_CREATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly assetRepository: AssetRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS[OP_ID], result: ECHO.OPERATION_RESULT[OP_ID]) {
		const [dAccount] = await this.echoService.checkAccounts([body.issuer]);
		const dAsset = await this.assetRepository.create({
			id: result,
			_account: dAccount,
			symbol: body.symbol,
			precision: body.precision,
			options: body.common_options,
			bitasset: body.common_options.flags ? body.bitasset_opts : null,
		});
		this.redisConnection.emit(REDIS.EVENT.NEW_ASSET, dAsset);
		return this.validateRelation({
			from: [body.issuer],
			assets: [result, body.fee.asset_id],
		});
	}
}
