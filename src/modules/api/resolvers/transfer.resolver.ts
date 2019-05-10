import AbstractResolver, { validateArgs, validateSubscriptionArgs } from './abstract.resolver';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import AssetRepository from '../../../repositories/asset.repository';
import Transfer from '../types/transfer.type';
import PaginatedResponse from '../types/paginated.response.type';
import TransferRepository from '../../../repositories/transfer.repository';
import TransferService from '../../../services/transfer.service';
import * as BALANCE from '../../../constants/balance.constants';
import * as REDIS from '../../../constants/redis.constants';
import * as TRANSFER from '../../../constants/transfer.constants';
import { TransferSubscribeForm, GetTransferHistoryForm } from '../forms/transfer.forms';
import { Resolver, Args, Query, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';

const paginatedTransfers = PaginatedResponse(Transfer);

interface ITransferSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_TRANSFER>;
	args: TransferSubscribeForm;
}
@Resolver(Transfer)
export default class TransferResolver extends AbstractResolver {
	@inject static transferService: TransferService;
	@inject static accountRepository: AccountRepository;
	@inject static assetRepository: AssetRepository;
	@inject static contractRepository: ContractRepository;
	@inject static transferRepository: TransferRepository;

	constructor(
		private transferService: TransferService,
		private accountRepository: AccountRepository,
		private assetRepository: AssetRepository,
		private contractRepository: ContractRepository,
		private transferRepository: TransferRepository,
	) {
		super();
	}

	// Query
	@Query(() => paginatedTransfers)
	@validateArgs(GetTransferHistoryForm)
	getTransferHistory(
		@Args() {
			count,
			offset,
			from,
			to,
			accounts,
			contracts,
			assets,
			tokens,
		}: GetTransferHistoryForm,
	) {
		return this.transferService.getTransferHistory(
			count,
			offset,
			{ from, to, accounts, contracts, assets, tokens },
		);
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

	static transferCreateFilter(
		{ payload: dTransfer, args: { from, to, assets, contracts } }: ITransferSubscriptionFilterArgs,
	) {
		const sender = this.transferRepository.getSender(dTransfer);
		const receiver = this.transferRepository.getReceiver(dTransfer);
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
