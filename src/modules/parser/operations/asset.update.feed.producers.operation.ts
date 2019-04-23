import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS;

export default class AssetUpdatehFeedProducers extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.ASSET_UPDATE_FEED_PRODUCERS;

	async parse(body: ECHO.OPERATION_PROPS[OP_ID]) {
		return this.validateRelation({
			from: [body.issuer],
			assets: [body.fee.asset_id, body.asset_to_update],
			accounts: body.new_feed_producers,
		});
	}
}
