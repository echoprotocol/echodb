import RedisConnection from '../../../connections/redis.connection';
import AbstractOperation from './abstract.operation';
import EchoService from '../../../services/echo.service';
import AssetRepository from '../../../repositories/asset.repository';
import AccountRepository from '../../../repositories/account.repository';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import { MongoId } from '../../../types/mongoose';

type OP_ID = ECHO.OPERATION_ID.ASSET_UPDATE;
type UpdateAsset = {
	_account?: MongoId;
	options?: ECHO.AssetOptions;
};

export default class AssetUpdateOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_UPDATE;

	constructor(
		readonly redisConnection: RedisConnection,
		readonly assetRepository: AssetRepository,
		readonly accountRepository: AccountRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		const toUpdate: UpdateAsset = {};
		if (body.new_issuer) {
			toUpdate._account = await this.accountRepository.findById(body.new_issuer);
		}
		if (body.new_options) toUpdate.options = body.new_options;
		await this.assetRepository.updateOne(
			{ id: body.asset_to_update },
			{ $set: toUpdate },
		);
		this.redisConnection.emit(REDIS.EVENT.ASSET_UPDATED, body.asset_to_update);
		return this.validateRelation({
			from: [body.issuer],
			accounts: [body.new_issuer],
			assets: [body.fee.asset_id, body.asset_to_update],
		});
	}

}
