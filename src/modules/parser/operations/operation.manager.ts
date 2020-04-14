import AbstractOperation from './abstract.operation';
import BalanceService from '../../../services/balance.service';
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
import SidechainErc20RegisterTokenOperation from './sidechain.erc20.register.token.operation';
import SidechainErc20DepositTokenOperation from './sidechain.erc20.deposit.token.operation';
import SidechainErc20WithdrawTokenOperation from './sidechain.erc20.withdraw.token.operation';
import SidechainErc20ApproveTokenWithdrawOperation from './sidechain.erc20.approve.token.withdraw.operation';
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
import BlockRewardOperation from './block.reward.operation';
import ContractInternalCreateOperaiton from './contract.internal.create.operation';
import ContractInternalCallOperation from './contract.internal.call.operation';
import ContractRepository from '../../../repositories/contract.repository';
import EchoRepository from '../../../repositories/echo.repository';
import ERC20TokenRepository from '../../../repositories/erc20-token.repository';
import EVMAddressRegister from './evm.address.register.operation';
import { IERC20TokenObject } from 'echojs-lib/types/interfaces/objects';

type OperationsMap = { [x in ECHO.OPERATION_ID]?: AbstractOperation<x> };

const logger = getLogger('operation.parser');

export default class OperationManager {
	private map: OperationsMap = {};

	constructor(
		readonly operationRepository: OperationRepository,
		readonly balanceService: BalanceService,
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
		balanceClaimOperation: BalanceClaimOperation,
		overrideTransferOperation: OverrideTransferOperation,
		committeeMemberUpdateGlobalParametersOperation: CommitteeMemberUpdateGlobalParametersOperation,
		vestingBalanceCreateOperation: VestingBalanceCreateOperation,
		vestingBalanceWithdrawOperation: VestingBalanceWithdrawOperation,
		proposalCreateOperation: ProposalCreateOperation,
		proposalUpdateOperation: ProposalUpdateOperation,
		proposalDeleteOperation: ProposalDeleteOperation,
		committeeMemberCreateOperation: CommitteeMemberCreateOperation,
		committeeMemberUpdateOperation: CommitteeMemberUpdateOperation,
		accountAddressCreateOperation: AccountAddressCreateOperation,
		transferToAddressOperation: TransferToAddressOperation,
		sidechainEthCreateAddressOperation: SidechainEthCreateAddressOperation,
		sidechainEthDepositOperation: SidechainEthDepositOperation,
		sidechainEthWithdrawOperation: SidechainEthWithdrawOperation,
		sidechainEthApproveAddressOperation: SidechainEthApproveAddressOperation,
		sidechainEthApproveWithdrawOperation: SidechainEthApproveWithdrawOperation,
		contractFundPoolOperation: ContractFundPoolOperation,
		blockRewardOperation: BlockRewardOperation,
		contractWhitelistOperation: ContractWhitelistOperation,
		sidechainEthIssueOperation: SidechainEthIssueOperation,
		sidechainEthBurnOperation: SidechainEthBurnOperation,
		sidechainErc20RegisterTokenOperation: SidechainErc20RegisterTokenOperation,
		sidechainErc20DepositTokenOperation: SidechainErc20DepositTokenOperation,
		sidechainErc20WithdrawTokenOperation: SidechainErc20WithdrawTokenOperation,
		sidechainErc20ApproveTokenWithdrawOperation: SidechainErc20ApproveTokenWithdrawOperation,
		contractUpdateOperation: ContractUpdateOperation,
		contractInternalCreateOperation: ContractInternalCreateOperaiton,
		contractInternalCallOperation: ContractInternalCallOperation,
		evmAddressRegisterOperation: EVMAddressRegister,
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
			sidechainEthWithdrawOperation,
			sidechainEthApproveAddressOperation,
			sidechainEthApproveWithdrawOperation,
			contractFundPoolOperation,
			blockRewardOperation,
			contractWhitelistOperation,
			sidechainEthIssueOperation,
			sidechainEthBurnOperation,
			sidechainErc20RegisterTokenOperation,
			sidechainErc20DepositTokenOperation,
			sidechainErc20WithdrawTokenOperation,
			sidechainErc20ApproveTokenWithdrawOperation,
			contractUpdateOperation,
			contractInternalCreateOperation,
			contractInternalCallOperation,
			evmAddressRegisterOperation,
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
	) {
		const operation: IOperation<T> = {
			id,
			body,
			result,
			block: dBlock ? dBlock._id : null,
			virtual: !!dBlock,
			_tx: dTx,
			timestamp: dateFromUtcIso(dTx ? dTx._block.timestamp : dBlock.timestamp),
			op_in_trx: opIndex,
			trx_in_block: txIndex,
			_relation: null,
		};
		if (this.map[id]) {
			operation._relation = await this.parseKnownOperation(id, body, result, dTx ? dTx._block : dBlock);
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
		id: T,
		body: ECHO.OPERATION_WITH_INJECTED_VIRTUALS<T>,
		result: ECHO.OPERATION_RESULT<T>,
		dBlock: TDoc<IBlock>,
	): Promise<IOperationRelation> {
		logger.trace(`Parsing ${ECHO.OPERATION_ID[id]} [${id}] operation`);
		const preInternalRelation = <IOperationRelation>await this.map[id].parse(body, result, dBlock);
		if (body.fee) await this.balanceService.takeFee(preInternalRelation.from[0], body.fee);
		if (body.virtual_operations) {
			for (const virtualOperation of body.virtual_operations) {
				const [vopId, vopProps] = virtualOperation;
				if (!this.map[vopId as ECHO.OPERATION_ID]) {
					logger.warn(`Internal operation ${vopId} is not supported`);
					continue;
				}
				await this.parseKnownOperation(vopId, vopProps, result, dBlock);
			}
		}

		const postInternalRelation = await this.map[id].postInternalParse(body, result, dBlock, preInternalRelation);
		await this.checkForTokenBalancesUpdating(id, body, result);
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
}
