import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_STAKE_BTC_UPDATE;

export default class SidechainStakeBtcUpdateOperation extends AbstractOperation<OP_ID> {
  id = ECHO.OPERATION_ID.SIDECHAIN_STAKE_BTC_UPDATE;

  constructor() {
    super();
  }

  async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
    return this.validateRelation({
      from: [body.owner],
      assets: [body.fee.asset_id],
    });
  }
}
