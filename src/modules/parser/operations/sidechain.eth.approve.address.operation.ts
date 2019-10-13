import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS;

export default class SidechainEthApproveAddress extends AbstractOperation<OP_ID> {
    id = ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS;
    
    constructor() {
		super();
    }
    
    async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
        return this.validateRelation({
            from: [body.committee_member_id],
            assets: [body.fee.asset_id],
        });
    }
}