import BN from 'bignumber.js';
import AbstractOperation from './abstract.operation';
import AssetRepository from '../../../repositories/asset.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

type OP_ID = ECHO.OPERATION_ID.ASSET_PUBLISH_FEED;

export default class AssetPublishFeedOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_PUBLISH_FEED;
	constructor(
		readonly assetRepository: AssetRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		return this.validateRelation({
			from: [body.publisher],
			to: [body.asset_id],
			assets: [
				body.fee.asset_id,
				body.core_exchange_rate.base.asset_id,
				body.core_exchange_rate.quote.asset_id,
			],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const asset = (await this.assetRepository.findById(body.asset_id)).options.core_exchange_rate;
		const assetPrice = new BN(asset.quote.amount).div(asset.base.amount).toString(10);
		body.feeded_asset_price = assetPrice;
		return <any>body;
	}
}
