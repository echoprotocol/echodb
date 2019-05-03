import AbstractResolver, { validateArgs, validateSubscriptionArgs } from './abstract.resolver';
import Asset from '../types/asset.type';
import AccountRepository from '../../../repositories/account.repository';
import PaginatedResponse from '../types/paginated.response.type';
import AssetService from '../../../services/asset.service';
import * as REDIS from '../../../constants/redis.constants';
import { NewAssetSubscriptionForm, GetAssetsForm, AssetSubscribeForm } from '../forms/asset.forms';
import { Resolver, FieldResolver, Root, Subscription, Query, Args } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { MongoId } from '../../../types/mongoose';
import { Payload } from '../../../types/graphql';

interface INewAssetSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.NEW_ASSET>;
	args: NewAssetSubscriptionForm;
}

interface IAssetSubscriptionFilterArgs {
	payload: Payload<REDIS.EVENT.ASSET_UPDATED>;
	args: AssetSubscribeForm;
}

const paginatedAssets = PaginatedResponse(Asset);

@Resolver(Asset)
export default class AssetResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;
	@inject static assetService: AssetService;

	constructor(
		private accountRepository: AccountRepository,
		private assetService: AssetService,
	) {
		super();
	}

	// FieldResolver
	@FieldResolver()
	account(@Root('_account') id: MongoId) {
		return this.resolveMongoField(id, this.accountRepository);
	}

	@validateArgs(GetAssetsForm)
	@Query(() => paginatedAssets)
	getAssets(@Args() { count, offset, symbols, assets, account }: GetAssetsForm) {
		return this.assetService.getAssets(count, offset, { symbols, assets, account });
	}

	// Subscription
	@Subscription(() => Asset, {
		topics: validateSubscriptionArgs(REDIS.EVENT.NEW_ASSET, NewAssetSubscriptionForm),
		filter: ({ payload: dAsset, args: { registrars, symbols } }: INewAssetSubscriptionFilterArgs) => {
			if (registrars && !registrars.includes(dAsset._account.id)) return false;
			if (symbols && !symbols.includes(dAsset.symbol)) return false;
			return true;
		},
	})
	newAsset(
		@Root() dAsset: Payload<REDIS.EVENT.NEW_ASSET>,
		@Args() _: NewAssetSubscriptionForm,
	) {
		return dAsset;
	}

	@Subscription(() => Asset, {
		topics: REDIS.EVENT.ASSET_UPDATED,
		filter: AssetResolver.assetChangeFilter,
	})
	assetUpdated(
		@Root() dAsset: Payload<REDIS.EVENT.ASSET_UPDATED>,
		@Args() _: AssetSubscribeForm,
	) {
		return dAsset;
	}

	static async assetChangeFilter(
		{ payload: dAsset, args: { assets } }: IAssetSubscriptionFilterArgs,
	) {
		return assets.includes(dAsset.id);
	}

}
