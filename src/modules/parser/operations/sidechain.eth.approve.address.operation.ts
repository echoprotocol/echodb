import AbstractOperation from './abstract.operation';
import AccountService from '../../../services/account.service';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { IBlock } from '../../../interfaces/IBlock';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS;

export default class SidechainEthApproveAddress extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS;

	constructor(
		private accountService: AccountService,
	) {
		super();
	}

	async parse(
		body: ECHO.OPERATION_PROPS<OP_ID>,
		_: ECHO.OPERATION_RESULT<OP_ID>,
		dBlock: TDoc<IBlock>,
		opIndex: Number,
		txIndex: Number,
		virtual: boolean,
	) {
		await this.accountService.updateCommitteeLastExecutedOperation(
			body.committee_member_id,
			dBlock.round,
			txIndex,
			opIndex,
			virtual,
		);
		return this.validateRelation({
			from: [body.committee_member_id],
			to: [body.account],
			accounts: body.malicious_committeemen,
			assets: [body.fee.asset_id],
		});
	}
}
