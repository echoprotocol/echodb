import AbstractResolver, { validateSubscriptionArgs } from './abstract.resolver';
import AccountRepository from '../../../repositories/account.repository';
import ContractRepository from '../../../repositories/contract.repository';
import AssetRepository from '../../../repositories/asset.repository';
import Transfer from '../types/transfer.type';
import * as BALANCE from '../../../constants/balance.constants';
import * as REDIS from '../../../constants/redis.constants';
import { TransferSubscribeForm } from '../forms/transfer.forms';
import { Resolver, Args, FieldResolver, Root, Subscription } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { Payload } from '../../../types/graphql';

interface ITransferSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_TRANSFER>;
	args: TransferSubscribeForm;
}
@Resolver(Transfer)
export default class TransferResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static contractRepository: ContractRepository;
	@inject static assetRepository: AssetRepository;

	constructor(
		private accountRepository: AccountRepository,
		private contractRepository: ContractRepository,
		private assetRepository: AssetRepository,
	) {
		super();
	}

	@FieldResolver()
	from(@Root('_from') id: Transfer['_from']) {
		return this.resolveMongoField(id, this.accountRepository);
	}

	@FieldResolver()
	to(@Root('_to') id: Transfer['_to']) {
		return this.resolveMongoField(id, this.accountRepository);
	}

	@FieldResolver()
	asset(@Root('type') type: Transfer['type'], @Root('_asset') id: Transfer['_asset']) {
		if (type !== BALANCE.TYPE.ASSET) return null;
		return this.resolveMongoField(id, this.assetRepository);
	}

	@FieldResolver()
	contract(@Root('type') type: Transfer['type'], @Root('_contract') id: Transfer['_contract']) {
		if (type !== BALANCE.TYPE.TOKEN) return null;
		return this.resolveMongoField(id, this.contractRepository);
	}
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
		if (from && !from.includes(dTransfer._from.id)) return false;
		if (to && !to.includes(dTransfer._to.id)) return false;
		if (assets || contracts) {
			const byAsset = assets && dTransfer.type === BALANCE.TYPE.ASSET && assets.includes(dTransfer._asset.id);
			const byToken =
				contracts
				&& dTransfer.type === BALANCE.TYPE.TOKEN
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
