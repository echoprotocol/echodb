import AbstractOperation from './abstract.operation';
import BlockRepository from '../../../repositories/block.repository';
import OperationRepository from '../../../repositories/operation.repository';
import EchoRepository from '../../../repositories/echo.repository';
import * as ECHO from '../../../constants/echo.constants';
import { IOperation } from 'interfaces/IOperation';
import { TDoc } from '../../../types/mongoose';

type OP_ID = ECHO.OPERATION_ID.SIDECHAIN_ERC20_ISSUE;

export default class SidechainErc20IssueOperation extends AbstractOperation<OP_ID> {
	id = ECHO.OPERATION_ID.SIDECHAIN_ERC20_ISSUE;

	constructor(
		private blockRepository: BlockRepository,
		private operationRepository: OperationRepository,
		private echoRepository: EchoRepository,
	) {
		super();
	}

	async parse(body: ECHO.OPERATION_PROPS<OP_ID>) {
		if (!body.deposit) {
			return this.validateRelation({
				from: [ECHO.COMMITTEE_GLOBAL_ACCOUNT],
				to: [body.account],
				assets: [ECHO.CORE_ASSET],
			});
		}

		const depositObject = <any>(await this.echoRepository.getObject(body.deposit));

		if (!depositObject) {
			return this.validateRelation({
				from: [ECHO.COMMITTEE_GLOBAL_ACCOUNT],
				to: [body.account],
				assets: [ECHO.CORE_ASSET],
			});
		}

		const { transaction_hash: txHash } = depositObject;

		const operations = <TDoc<IOperation<ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN>>[]>
			(await this.operationRepository.find({
				id: ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN,
				'body.transaction_hash': txHash,
			}));

		const modifaedOps = operations.map((op) => {
			op.body.deposit_id = body.deposit;
			return op.save();
		});

		await Promise.all(modifaedOps);

		return this.validateRelation({
			from: [ECHO.COMMITTEE_GLOBAL_ACCOUNT],
			to: [body.account],
			assets: [ECHO.CORE_ASSET],
		});
	}

	async modifyBody<Y extends ECHO.KNOWN_OPERATION>(operation: IOperation<Y>) {
		const { body } = <IOperation<OP_ID>>operation;
		const depositOperation =  await this.operationRepository.findOne({
			'body.deposit_id': body.deposit,
			id: ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN,
		});

		if (!depositOperation) {
			return <any>body;
		}

		const block = await this.blockRepository.findByMongoId(depositOperation.block);

		if (!block) {
			return <any>body;
		}

		const result = `${block.round}-${depositOperation.trx_in_block}-${depositOperation.op_in_trx}`;
		body.sidchain_erc_20_deposit_token = result;
		return <any>body;
	}
}
