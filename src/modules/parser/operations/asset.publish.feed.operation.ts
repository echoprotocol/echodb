import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_PUBLISH_FEED;

export default class AssetPublishFeedOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_PUBLISH_FEED;

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
}
