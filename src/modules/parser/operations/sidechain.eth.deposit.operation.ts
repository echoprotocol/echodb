import AbstractOperation from './abstract.operation';
import * as ECHO from '../../../constants/echo.constants';
import { TDoc } from '../../../types/mongoose';
import { IBlock } from '../../../interfaces/IBlock';
import { IOperation } from 'interfaces/IOperation';
import EchoRepository from '../../../repositories/echo.repository';
import AccountService from '../../../services/account.service';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT;

export default class SidechainEthDepositOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT;

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
			to: [body.account],
			assets: [body.fee.asset_id],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const accountEthAddress = await this.echoRepository.getEthAddress(body.account);
		body.from_address = accountEthAddress.eth_addr;
		return <any>body;
	}
}
