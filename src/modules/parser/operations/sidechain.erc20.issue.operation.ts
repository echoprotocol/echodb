import AbstractOperation from './abstract.operation';
import BlockRepository from '../../../repositories/block.repository';
import OperationRepository from '../../../repositories/operation.repository';
import EchoRepository from '../../../repositories/echo.repository';
import ContractRepository from '../../../repositories/contract.repository';
import ERC20TokenRepository from '../../../repositories/erc20-token.repository';
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
		private contractRepository: ContractRepository,
		private erc20TokenRepository: ERC20TokenRepository,
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

		if (depositOperation) {
			const block = await this.blockRepository.findByMongoId(depositOperation.block);

			if (block) {
				const result = `${block.round}-${depositOperation.trx_in_block}-${depositOperation.op_in_trx}`;
				body.sidchain_erc_20_deposit_token = result;
			}
		}

		const depositSendOperations =  await this.operationRepository.find({
			'body.deposit_id': body.deposit,
			id: ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN,
		});

		if (!depositSendOperations.length) {
			return <any>body;
		}

		const uniqueBlocksIds = depositSendOperations.map(({ block }) => block);
		const blocks = await this.blockRepository.find({ _id: { $in: uniqueBlocksIds } });

		const listOfApprovals = depositSendOperations.map((op) => {
			const operationBlock = blocks.find((b) => String(b._id) === String(op.block));
			return `${operationBlock.round}-${op.trx_in_block}-${op.op_in_trx}`;
		});

		body.list_of_approvals = listOfApprovals;

		try {
			const depositTokenId = body.token;
			const depositToken = await this.echoRepository.getObject(depositTokenId);
			const ethAddres = (<any>depositToken).eth_addr;

			const erc20Token = await this.erc20TokenRepository.findOne({
				eth_addr: ethAddres,
			});
			const contract = await this.contractRepository.findByMongoId(erc20Token.contract);
			const tokenInfo = {
				precision: erc20Token.decimals,
				symbol: erc20Token.symbol,
				contractId: contract.id,
			};
			body.erc20_token_info = tokenInfo;
		} catch (e) {
			body.erc20_token_info = {};
		}

		return <any>body;
	}
}
