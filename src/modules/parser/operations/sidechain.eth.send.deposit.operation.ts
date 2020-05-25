import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { IBlock } from '../../../interfaces/IBlock';
import { IOperation } from 'interfaces/IOperation';
import EchoRepository from '../../../repositories/echo.repository';
import AccountService from '../../../services/account.service';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT;

export default class SidechainEthSendDepositOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT;

	constructor(
		private echoRepository: EchoRepository,
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
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const depositId = body.deposit_id;
		const depositObject = <any>(await this.echoRepository.getObject(depositId));
		body.account = depositObject.account;
		body.amount = depositObject.value;
		return <any>body;
	}
}
