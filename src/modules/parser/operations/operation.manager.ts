import { BlockVirtualOperation } from 'echojs-lib';
import AbstractOperation from './abstract.operation';
import BalanceService from '../../../services/balance.service';
import AccountService from '../../../services/account.service';
import AccountCreateOperation from './account.create.operation';
import AccountUpdateOperation from './account.update.operation';
import AccountWhitelistOperation from './account.whitelist.operation';
import AssetCreateOperation from './asset.create.operation';
import TransferOperation from './transfer.operation';
import AssetClaimFeesOperation from './asset.claim.fees.operation';
import AssetUpdateOperation from './asset.update.operation';
import AssetBitassetUpdateOperation from './asset.bitasset.update.operation';
import AssetIssueOperation from './asset.issue.operation';
import AssetReserverOperation from './asset.reserve.operation';
import AssetFundFeePoolOperation from './asset.fund.fee.pool.operation';
import AssetPublishFeedOperation from './asset.publish.feed.operation';
import AssetUpdateFeedProducersOperation from './asset.update.feed.producers.operation';
import BalanceFreezeOperation from './balance.freeze.operation';
import BalanceUnfreezeOperation from './balance.unfreeze.operation';
import ContractCreateOperation from './contract.create.operation';
import ContractCallOperation from './contract.call.operation';
import BalanceClaimOperation from './balance.claim.operation';
import OverrideTransferOperation from './override.transfer.operation';
import CommitteeMemberUpdateGlobalParametersOperation from './committee.member.update.global.parameters.operation';
import CommitteeMemberActivateOperation from './committee.member.activate.operation';
import CommitteeMemberDeactivateOperation from './committee.member.deactivate.operation';
import CommitteeFrozenBalanceOperation from './committee.frozen.balance.operation';
import VestingBalanceWithdrawOperation from './vesting.balance.withdraw.operation';
import VestingBalanceCreateOperation from './vesting.balance.create.operation';
import ProposalCreateOperation from './proposal.create.operation';
import ProposalUpdateOperation from './proposal.update.operation';
import ProposalDeleteOperation from './proposal.delete.operation';
import CommitteeMemberCreateOperation from './committee.member.create.operation';
import CommitteeMemberUpdateOperation from './committee.member.update.operation';
import AccountAddressCreateOperation from './account.address.create.operation';
import TransferToAddressOperation from './transfer.to.address.operation';
import SidechainEthCreateAddressOperation from './sidechain.eth.create.address.operation';
import SidechainEthApproveAddressOperation from './sidechain.eth.approve.address.operation';
import SidechainEthDepositOperation from './sidechain.eth.deposit.operation';
import SidechainEthWithdrawOperation from './sidechain.eth.withdraw.operation';
import SidechainEthApproveWithdrawOperation from './sidechain.eth.approve.withdraw.operation';
import ContractFundPoolOperation from './contract.fund.pool.operation';
import ContractWhitelistOperation from './contract.whitelist.operation';
import SidechainEthIssueOperation from './sidechain.eth.issue.operation';
import SidechainEthBurnOperation from './sidechain.eth.burn.operation';
import SidechainEthSendWithdrawOperation from './sidechain.eth.send.withdraw.operation';
import SidechainErc20RegisterTokenOperation from './sidechain.erc20.register.token.operation';
import SidechainErc20DepositTokenOperation from './sidechain.erc20.deposit.token.operation';
import SidechainErc20SendDepositTokenOperation from './sidechain.erc20.send.deposit.token.operation';
import SidechainErc20SendWithdrawTokenOperation from './sidechain.erc20.send.withdraw.token.operation';
import SidechainErc20WithdrawTokenOperation from './sidechain.erc20.withdraw.token.operation';
import SidechainErc20ApproveTokenWithdrawOperation from './sidechain.erc20.approve.token.withdraw.operation';
import SidechainErc20BurnOperation from './sidechain.erc20.burn.operation';
import SidechainErc20IssueOperation from './sidechain.erc20.issue.operation';
import ContractUpdateOperation from './contract.update.operation';
import OperationRepository from '../../../repositories/operation.repository';
import RedisConnection from '../../../connections/redis.connection';
import * as ECHO from '../../../constants/echo.constants';
import * as REDIS from '../../../constants/redis.constants';
import * as OPERATION from '../../../constants/operation.constants';
import { TYPE } from '../../../constants/contract.constants';
import { IOperation, IOperationRelation } from 'interfaces/IOperation';
import { ITransactionExtended } from '../../../interfaces/ITransaction';
import { TDoc } from '../../../types/mongoose';
import { getLogger } from 'log4js';
import { dateFromUtcIso, ethAddrToEchoId } from '../../../utils/format';
import { IBlock } from '../../../interfaces/IBlock';
import { removeDuplicates } from '../../../utils/common';
import BlockRewardOperation from './block.reward.operation';
import ContractInternalCreateOperaiton from './contract.internal.create.operation';
import ContractInternalCallOperation from './contract.internal.call.operation';
import ContractRepository from '../../../repositories/contract.repository';
import EchoRepository from '../../../repositories/echo.repository';
import ERC20TokenRepository from '../../../repositories/erc20-token.repository';
import EVMAddressRegister from './evm.address.register.operation';
import { IERC20TokenObject } from 'echojs-lib/types/interfaces/objects';
import SidechainBtcCreateIntermediateDepositOperation from './sidechain.btc.create.intermediate.deposit.operation';
import SidechainBtcIntermediateDepositOperation from './sidechain.btc.intermediate.deposit.operation';
import SidechainBtcDepositOperation from './sidechain.btc.deposit.operation';
import SidechainBtcAggregateOperation from './sidechain.btc.aggregate.operation';
import SidechainBtcApproveAggregateOperation from './sidechain.btc.approve.aggregate.operation';
import SidechainBtcCreateAddressOperation from './sidechain.btc.create.address.operation';
import SidechainBtcWithdrawOperation from './sidechain.btc.withdraw.operation';
import ContractSelfdestructOperation from './contract.selfdestruct.operation';
import SidechainEthSendDepositOperation from './sidechain.eth.send.deposit.operation';
import DidCreateOperation from './did.create.operation';
import DidUpdateOperation from './did.update.operation';
import DidDeleteOperation from './did.delete.operation';

type OperationsMap = { [x in ECHO.OPERATION_ID]?: AbstractOperation<x> };

const logger = getLogger('operation.parser');

export default class OperationManager {
	private map: OperationsMap = {};

	constructor(
		readonly operationRepository: OperationRepository,
		readonly balanceService: BalanceService,
		readonly accountService: AccountService,
		readonly redisConnection: RedisConnection,
		readonly contractRepository: ContractRepository,
		readonly echoRepository: EchoRepository,
		readonly erc20TokenRepository: ERC20TokenRepository,
		transferOperation: TransferOperation,
		accountCreateOperation: AccountCreateOperation,
		accountUpdateOperation: AccountUpdateOperation,
		accountWhitelistOperation: AccountWhitelistOperation,
		assetCreateOperation: AssetCreateOperation,
		assetClaimFeesOperation: AssetClaimFeesOperation,
		assetUpdateOperation: AssetUpdateOperation,
		assetBitassetUpdateOperation: AssetBitassetUpdateOperation,
		assetIssueOperation: AssetIssueOperation,
		assetReserveOperation: AssetReserverOperation,
		assetFundFeePoolOperation: AssetFundFeePoolOperation,
		assetPublishFeedOperation: AssetPublishFeedOperation,
		assetUpdateFeedProducersOperation: AssetUpdateFeedProducersOperation,
		balanceFreezeOperation: BalanceFreezeOperation,
		balanceUnfreezeOperation: BalanceUnfreezeOperation,
		contractCreateOperation: ContractCreateOperation,
		contractCallOperation: ContractCallOperation,
		contractSelfdestructOperation: ContractSelfdestructOperation,
		sidechainBtcWithdrawOperation: SidechainBtcWithdrawOperation,
		balanceClaimOperation: BalanceClaimOperation,
		overrideTransferOperation: OverrideTransferOperation,
		committeeMemberUpdateGlobalParametersOperation: CommitteeMemberUpdateGlobalParametersOperation,
		committeeMemberActivateOperation: CommitteeMemberActivateOperation,
		committeeMemberDeactivateOperation: CommitteeMemberDeactivateOperation,
		committeeFrozenBalanceOperation: CommitteeFrozenBalanceOperation,
		vestingBalanceCreateOperation: VestingBalanceCreateOperation,
		vestingBalanceWithdrawOperation: VestingBalanceWithdrawOperation,
		proposalCreateOperation: ProposalCreateOperation,
		proposalUpdateOperation: ProposalUpdateOperation,
		proposalDeleteOperation: ProposalDeleteOperation,
		committeeMemberCreateOperation: CommitteeMemberCreateOperation,
		committeeMemberUpdateOperation: CommitteeMemberUpdateOperation,
		accountAddressCreateOperation: AccountAddressCreateOperation,
		transferToAddressOperation: TransferToAddressOperation,
		sidechainBtcCreateAddressOperation: SidechainBtcCreateAddressOperation,
		sidechainBtcDepositOperation: SidechainBtcDepositOperation,
		sidechainBtcIntermediateDepositOperation: SidechainBtcIntermediateDepositOperation,
		sidechainBtcCreateIntermediateDepositOperation: SidechainBtcCreateIntermediateDepositOperation,
		sidechainBtcAggregateOperation: SidechainBtcAggregateOperation,
		sidechainBtcApproveAggregateOperation: SidechainBtcApproveAggregateOperation,
		sidechainEthCreateAddressOperation: SidechainEthCreateAddressOperation,
		sidechainEthDepositOperation: SidechainEthDepositOperation,
		sidechainEthSendDepositOperation: SidechainEthSendDepositOperation,
		sidechainEthWithdrawOperation: SidechainEthWithdrawOperation,
		sidechainEthApproveAddressOperation: SidechainEthApproveAddressOperation,
		sidechainEthApproveWithdrawOperation: SidechainEthApproveWithdrawOperation,
		contractFundPoolOperation: ContractFundPoolOperation,
		blockRewardOperation: BlockRewardOperation,
		contractWhitelistOperation: ContractWhitelistOperation,
		sidechainEthIssueOperation: SidechainEthIssueOperation,
		sidechainEthBurnOperation: SidechainEthBurnOperation,
		sidechainErc20RegisterTokenOperation: SidechainErc20RegisterTokenOperation,
		sidechainEthSendWithdrawOperation: SidechainEthSendWithdrawOperation,
		sidechainErc20DepositTokenOperation: SidechainErc20DepositTokenOperation,
		sidechainErc20SendDepositTokenOperation: SidechainErc20SendDepositTokenOperation,
		sidechainErc20SendWithdrawTokenOperation: SidechainErc20SendWithdrawTokenOperation,
		sidechainErc20WithdrawTokenOperation: SidechainErc20WithdrawTokenOperation,
		sidechainErc20ApproveTokenWithdrawOperation: SidechainErc20ApproveTokenWithdrawOperation,
		sidechainErc20BurnOperation: SidechainErc20BurnOperation,
		sidechainErc20IssueOperation: SidechainErc20IssueOperation,
		contractUpdateOperation: ContractUpdateOperation,
		contractInternalCreateOperation: ContractInternalCreateOperaiton,
		contractInternalCallOperation: ContractInternalCallOperation,
		evmAddressRegisterOperation: EVMAddressRegister,
		didCreateOperation: DidCreateOperation,
		didUpdateOperation: DidUpdateOperation,
		didDeleteOperation: DidDeleteOperation,
	) {
		const operations: AbstractOperation<ECHO.KNOWN_OPERATION>[] = [
			accountCreateOperation,
			accountUpdateOperation,
			accountWhitelistOperation,
			assetCreateOperation,
			assetUpdateOperation,
			assetBitassetUpdateOperation,
			balanceFreezeOperation,
			balanceUnfreezeOperation,
			contractCreateOperation,
			contractCallOperation,
			assetIssueOperation,
			assetReserveOperation,
			assetFundFeePoolOperation,
			assetPublishFeedOperation,
			assetClaimFeesOperation,
			assetUpdateFeedProducersOperation,
			transferOperation,
			balanceClaimOperation,
			overrideTransferOperation,
			committeeMemberUpdateGlobalParametersOperation,
			committeeMemberActivateOperation,
			committeeMemberDeactivateOperation,
			committeeFrozenBalanceOperation,
			vestingBalanceCreateOperation,
			vestingBalanceWithdrawOperation,
			proposalCreateOperation,
			proposalUpdateOperation,
			proposalDeleteOperation,
			committeeMemberCreateOperation,
			committeeMemberUpdateOperation,
			accountAddressCreateOperation,
			transferToAddressOperation,
			sidechainEthCreateAddressOperation,
			sidechainEthDepositOperation,
			sidechainEthSendDepositOperation,
			sidechainEthWithdrawOperation,
			sidechainEthApproveAddressOperation,
			sidechainEthApproveWithdrawOperation,
			contractFundPoolOperation,
			contractSelfdestructOperation,
			sidechainBtcWithdrawOperation,
			blockRewardOperation,
			contractWhitelistOperation,
			sidechainBtcCreateAddressOperation,
			sidechainBtcAggregateOperation,
			sidechainBtcDepositOperation,
			sidechainBtcIntermediateDepositOperation,
			sidechainBtcCreateIntermediateDepositOperation,
			sidechainBtcApproveAggregateOperation,
			sidechainEthIssueOperation,
			sidechainEthBurnOperation,
			sidechainErc20RegisterTokenOperation,
			sidechainEthSendWithdrawOperation,
			sidechainErc20DepositTokenOperation,
			sidechainErc20SendDepositTokenOperation,
			sidechainErc20SendWithdrawTokenOperation,
			sidechainErc20WithdrawTokenOperation,
			sidechainErc20ApproveTokenWithdrawOperation,
			sidechainErc20BurnOperation,
			sidechainErc20IssueOperation,
			contractUpdateOperation,
			contractInternalCreateOperation,
			contractInternalCallOperation,
			evmAddressRegisterOperation,
			didCreateOperation,
			didUpdateOperation,
			didDeleteOperation,
		];
		for (const operation of operations) {
			if (!operation.status) return;
			this.map[operation.id] = operation;
		}
	}

	// FIXME: emit all (not only parsed) operations
	async parse<T extends ECHO.KNOWN_OPERATION>(
		[id, body]: [T, T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_WITH_INJECTED_VIRTUALS<T> : unknown],
		[_, result]: [unknown, T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_RESULT<T> : unknown],
		dTx: TDoc<ITransactionExtended> | null,
		dBlock?: TDoc<IBlock>,
		opIndex: number = 0,
		txIndex: number = 0,
		vopIndex: number | null = null,
		virtual?: boolean,
	) {
		const operation: IOperation<T> = {
			id,
			body,
			result,
			block: dBlock ? dBlock._id : null,
			virtual: !!virtual,
			_tx: dTx,
			timestamp: dateFromUtcIso(dTx ? dTx._block.timestamp : dBlock.timestamp),
			op_in_trx: opIndex,
			trx_in_block: txIndex,
			_relation: null,
			vop_index: vopIndex,
			internal_operations_count: (body.virtual_operations && body.virtual_operations.length) || 0,
		};
		if (this.map[id]) {
			operation._relation = await this.parseKnownOperation(
				operation,
				dTx ? dTx._block : dBlock,
				dTx,
				body.virtual_operations,
			);
			operation.body = <T extends ECHO.KNOWN_OPERATION ? ECHO.OPERATION_WITH_INJECTED_VIRTUALS<T> : unknown>
				await this.map[id].modifyBody(operation, result, dBlock);
		} else {
			logger.warn(`Operation ${id} is not supported`);
			const feePayer = OPERATION.FEE_PAYER_FIELD[id];
			// FIXME: refactor
			if (feePayer) {
				await this.balanceService.takeFee((<any>body)[feePayer], (<any>body).fee);
			} else {
				logger.warn(`Fee of operation ${id} wasn't taken into account`);
			}
		}
		const dOperation = await this.operationRepository.create(operation);
		this.redisConnection.emit(REDIS.EVENT.NEW_OPERATION, dOperation);
	}

	async parseKnownOperation<T extends ECHO.KNOWN_OPERATION>(
		operation: IOperation<T>,
		dBlock: TDoc<IBlock>,
		dTx: TDoc<ITransactionExtended> | null,
		virtualOperations: BlockVirtualOperation['op'][],
	): Promise<IOperationRelation> {
		const { id, body, result } = operation;
		logger.trace(`Parsing ${ECHO.OPERATION_ID[id]} [${id}] operation`);
		const preInternalRelation = <IOperationRelation>await this.map[id].parse(
			body,
			result,
			dBlock,
			operation.op_in_trx,
			operation.trx_in_block,
			operation.virtual,
		);
		if (body.fee) await this.balanceService.takeFee(preInternalRelation.from[0], body.fee);
		if (virtualOperations) {
			for (let vopIndex = 0; vopIndex < virtualOperations.length; vopIndex += 1) {
				const virtualOperation = virtualOperations[vopIndex];
				const [vopId, vopProps] = virtualOperation;
				if (!this.map[vopId as ECHO.OPERATION_ID]) {
					logger.warn(`Internal operation ${vopId} is not supported`);
					continue;
				}
				await this.parse(
					[vopId, vopProps],
					[null, result],
					dTx,
					dBlock,
					operation.op_in_trx,
					operation.trx_in_block,
					vopIndex,
					true,
				);
			}
		}

		const postInternalRelation = await this.map[id].postInternalParse(
			body,
			result,
			dBlock,
			preInternalRelation,
			operation.op_in_trx,
			operation.trx_in_block,
			operation.virtual,
		);
		await this.checkForTokenBalancesUpdating(id, body, result);
		await this.updateLastExecutedCommitteeOperation(
			id,
			body,
			dBlock.round,
			operation.trx_in_block,
			operation.op_in_trx,
			operation.virtual,
		);
		return postInternalRelation;
	}

	async checkForTokenBalancesUpdating<T extends ECHO.KNOWN_OPERATION>(
		id: T,
		body: ECHO.OPERATION_PROPS<T>,
		result: ECHO.OPERATION_RESULT<T>,
	): Promise<void> {
		const operationsPotentionalTransferTokens = [
			ECHO.OPERATION_ID.CONTRACT_CREATE,
			ECHO.OPERATION_ID.CONTRACT_CALL,
			ECHO.OPERATION_ID.CONTRACT_INTERNAL_CREATE,
			ECHO.OPERATION_ID.CONTRACT_INTERNAL_CALL,
			ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN,
			ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN,
			ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN,
		];
		if (!operationsPotentionalTransferTokens.some((opId) => id === opId)) {
			return;
		}
		let contractId: string;
		let contract = null;
		switch (id) {
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_REGISTER_TOKEN:
				const tokenContractAddress = (await this.erc20TokenRepository.findOne({ id: <string>result })).contract;
				contract = await this.contractRepository.findByMongoId(tokenContractAddress);
				break;
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN:
				const erc20TokenContract = (await this.erc20TokenRepository.findOne({
					eth_addr:
						(<ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN>>body).erc20_token_addr,
				})).contract;
				contract = await this.contractRepository.findByMongoId(erc20TokenContract);
				break;
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN:
				contractId = (<IERC20TokenObject>(await this.echoRepository.getObject(
					(<ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ERC20_WITHDRAW_TOKEN>>body).erc20_token,
				))).contract;
				break;
			case ECHO.OPERATION_ID.CONTRACT_CREATE:
			case ECHO.OPERATION_ID.CONTRACT_INTERNAL_CREATE:
				const [contractType, contractResult] = await this.echoRepository.getContractResult(<string>result);
				if (contractType !== 0) {
					return;
				}
				const { exec_res: { new_address: hexAddr } } = contractResult;
				contractId = ethAddrToEchoId(hexAddr);
				break;
			case ECHO.OPERATION_ID.CONTRACT_CALL:
			case ECHO.OPERATION_ID.CONTRACT_INTERNAL_CALL:
				contractId = (<ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.CONTRACT_CALL>>body).callee;
				break;
			default:
				return;
		}
		!contract && (contract = await this.contractRepository.findById(contractId));
		if (!contract || contract.type !== TYPE.ERC20) {
			return;
		}
		const allBalanceQuery = {
			amount: { $ne: '0' },
			_contract: contract._id,
		};
		const holdersAmount = await this.balanceService.balanceRepository.count(allBalanceQuery);
		contract.token_info.holders_count = holdersAmount;
		await contract.save();
	}

	async updateLastExecutedCommitteeOperation<T extends ECHO.KNOWN_OPERATION>(
		id: T,
		body: ECHO.OPERATION_PROPS<T>,
		blockRound: Number,
		transactionIndex: Number,
		operationIndex: Number,
		virtual: boolean,
	): Promise<void> {
		let accountIds: string[] = [];
		switch (id) {
			case ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS:
			case ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT:
			case ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT:
			case ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_WITHDRAW:
			case ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_WITHDRAW:
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN:
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN:
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_WITHDRAW_TOKEN:
			case ECHO.OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW:
			case ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT:
			case ECHO.OPERATION_ID.SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT:
			case ECHO.OPERATION_ID.SIDECHAIN_BTC_DEPOSIT:
			case ECHO.OPERATION_ID.SIDECHAIN_BTC_AGGREGATE:
			case ECHO.OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE: {
				const accountId = (body as
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_ADDRESS> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ETH_DEPOSIT> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_DEPOSIT> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ETH_SEND_WITHDRAW> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ETH_APPROVE_WITHDRAW> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ERC20_DEPOSIT_TOKEN> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_DEPOSIT_TOKEN> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ERC20_SEND_WITHDRAW_TOKEN> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_ERC20_APPROVE_TOKEN_WITHDRAW> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_BTC_CREATE_INTERMEDIATE_DEPOSIT> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_BTC_INTERMEDIATE_DEPOSIT> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_BTC_DEPOSIT> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_BTC_AGGREGATE> |
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.SIDECHAIN_BTC_APPROVE_AGGREGATE>
				).committee_member_id;
				accountIds = [accountId];
				break;
			}
			case ECHO.OPERATION_ID.PROPOSAL_UPDATE: {
				const { active_approvals_to_remove, active_approvals_to_add } = (body as
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.PROPOSAL_UPDATE>
				);
				accountIds = removeDuplicates([...active_approvals_to_remove, ...active_approvals_to_add]);
			}
			case ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE: {
				const { committee_member_account } = (body as
					ECHO.OPERATION_PROPS<ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE>
				);
				accountIds = [committee_member_account];
			}
			case ECHO.OPERATION_ID.COMMITTEE_MEMBER_UPDATE_GLOBAL_PARAMETERS: {
				accountIds = [ECHO.COMMITTEE_GLOBAL_ACCOUNT];
			}
			default:
				return;
		}
		if (!accountIds.length) {
			return;
		}

		const updateAccountPromises = accountIds
			.map((accountId) => this.accountService.updateCommitteeLastExecutedOperation(
				accountId,
				id,
				blockRound,
				transactionIndex,
				operationIndex,
				virtual,
			));

		await Promise.all(updateAccountPromises);
	}
}
