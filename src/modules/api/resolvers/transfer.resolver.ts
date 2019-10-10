import AbstractResolver, { validateSubscriptionArgs, validateArgs } from './abstract.resolver';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import AssetRepository from '../../../repositories/asset.repository';
import Transfer from '../types/transfer.type';
import PaginatedResponse from '../types/paginated.response.type';
import TransferRepository from '../../../repositories/transfer.repository';
import * as BALANCE from '../../../constants/balance.constants';
import * as REDIS from '../../../constants/redis.constants';
import * as TRANSFER from '../../../constants/transfer.constants';
import { TransferSubscribeForm, GetTransfersHistoryForm } from '../forms/transfer.forms';
import { Resolver, Args, FieldResolver, Root, Subscription, Query } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';
import TransferService from '../../../services/transfer.service';

const paginatedTransfers = PaginatedResponse(Transfer);

interface ITransferSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_TRANSFER>;
	args: TransferSubscribeForm;
}
@Resolver(Transfer)
export default class TransferResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static assetRepository: AssetRepository;
	@inject static contractRepository: ContractRepository;
	@inject static transferrepository: TransferRepository;
	@inject static transferService: TransferService;

	constructor(
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private contractRepository: ContractRepository,
		private transferRepository: TransferRepository,
		private transferService: TransferService,
	) {
		super();
	}

	// FieldResolver
	@FieldResolver()
	from(
		@Root('relationType') relationType: Transfer['relationType'],
		@Root('_fromAccount') fromAccount: Transfer['_fromAccount'],
		@Root('_fromContract') fromContract: Transfer['_fromContract'],
	) {
		const senderType = this.transferRepository.getSenderType(relationType);
		if (senderType === TRANSFER.PARTICIPANT_TYPE.ACCOUNT) {
			return this.resolveMongoField(fromAccount, this.accountRepository);
		}
		if (senderType === TRANSFER.PARTICIPANT_TYPE.CONTRACT) {
			return this.resolveMongoField(fromContract, this.contractRepository);
		}
	}

	@FieldResolver()
	to(
		@Root('relationType') relationType: Transfer['relationType'],
		@Root('_toAccount') toAccount: Transfer['_toAccount'],
		@Root('_toContract') toContract: Transfer['_toContract'],
	) {
		const receiverType = this.transferRepository.getReceiverType(relationType);
		if (receiverType === TRANSFER.PARTICIPANT_TYPE.ACCOUNT) {
			return this.resolveMongoField(toAccount, this.accountRepository);
		}
		if (receiverType === TRANSFER.PARTICIPANT_TYPE.CONTRACT) {
			return this.resolveMongoField(toContract, this.contractRepository);
		}
	}

	@FieldResolver()
	asset(@Root('valueType') type: Transfer['valueType'], @Root('_asset') id: Transfer['_asset']) {
		if (type !== BALANCE.TYPE.ASSET) return null;
		return this.resolveMongoField(id, this.assetRepository);
	}

	@FieldResolver()
	contract(@Root('valueType') type: Transfer['valueType'], @Root('_contract') id: Transfer['_contract']) {
		if (type !== BALANCE.TYPE.TOKEN) return null;
		return this.resolveMongoField(id, this.contractRepository);
	}

	@FieldResolver()
	type(@Root('valueType') type: Transfer['valueType']) {
		return type;
	}

	// Subscription
	@Subscription(() => Transfer, {
		topics: validateSubscriptionArgs(REDIS.EVENT.NEW_TRANSFER, TransferSubscribeForm),
		filter: TransferResolver.transferCreateFilter,
	})
	newTransfer(
		@Root() dTransfer: Payload<REDIS.EVENT.NEW_TRANSFER>,
		@Args() _: TransferSubscribeForm,
	) {
		return dTransfer;
	}

	// Query
	@Query(() => paginatedTransfers)
	@validateArgs(GetTransfersHistoryForm)
	getTransferHistory(
		@Args() {
			count,
			offset,
			from,
			to,
			contracts,
			relationTypes,
			valueTypes,
			amounts,
			sort,
		}: GetTransfersHistoryForm,
	) {
		return this.transferService.getHistory(
			count,
			offset,
			{ from, to, contracts, relationTypes, valueTypes, amounts, sort },
		);
	}

	static transferCreateFilter(
		{ payload: dTransfer, args: { from, to, assets, contracts } }: ITransferSubscriptionFilterArgs,
	) {
		const sender = this.transferrepository.getSender(dTransfer);
		const receiver = this.transferrepository.getReceiver(dTransfer);
		if (from && !from.includes(sender.id)) return false;
		if (to && !to.includes(receiver.id)) return false;
		if (assets || contracts) {
			const byAsset = assets
				&& dTransfer.valueType === BALANCE.TYPE.ASSET
				&& assets.includes(dTransfer._asset.id);
			const byToken =
				contracts
				&& dTransfer.valueType === BALANCE.TYPE.TOKEN
				&& contracts.includes(dTransfer._contract.id);

			if (assets && contracts) {
				if (!byAsset && !byToken) return false;
			} else {
				if (assets && !byAsset) return false;
				if (contracts && !byToken) return false;
			}
		}
		return true;
	}

}
