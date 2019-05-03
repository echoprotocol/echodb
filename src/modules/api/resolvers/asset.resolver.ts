import AbstractResolver, { validateArgs } from './abstract.resolver';
import Asset from '../types/asset.type';
import AccountRepository from '../../../repositories/account.repository';
import PaginatedResponse from '../types/paginated.response.type';
import AssetService from '../../../services/asset.service';
import { Resolver, FieldResolver, Root, Query, Args } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';
import { MongoId } from '../../../types/mongoose';
import { GetAssetsForm } from '../forms/asset.forms';

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

	@FieldResolver()
	account(@Root('_account') id: MongoId) {
		return this.resolveMongoField(id, this.accountRepository);
	}

	@validateArgs(GetAssetsForm)
	@Query(() => paginatedAssets)
	getAssets(@Args() { count, offset, symbols, assets, account }: GetAssetsForm) {
		return this.assetService.getAssets(count, offset, { symbols, assets, account });
	}

}
