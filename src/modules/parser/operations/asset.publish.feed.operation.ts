import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';

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

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		body.sender = body.issuer;
		body.asset = body.asset_to_issue.asset_id;
		body.receiver = body.issue_to_account;
		const asset = (await this.assetRepository.findById(body.asset_to_issue.asset_id)).dynamic.current_supply;
		body.current_asset_total_supply = asset;
		return <any>body;
	}
}
