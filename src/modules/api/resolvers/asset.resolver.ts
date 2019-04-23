import AbstractResolver from './abstract.resolver';
import Asset from '../types/asset.type';
import AccountRepository from '../../../repositories/account.repository';
import { Resolver, FieldResolver, Root } from 'type-graphql';
import { inject } from '../../../utils/graphql';
import { isMongoObjectId } from '../../../utils/validators';
import { MongoId } from '../../../types/mongoose';

@Resolver(Asset)
export default class AssetResolver extends AbstractResolver {
	@inject static accountRepository: AccountRepository;

	constructor(
		private accountRepository: AccountRepository,
	) {
		super();
	}

	@FieldResolver()
	account(@Root('_account') account: MongoId) {
		if (isMongoObjectId(account)) return this.accountRepository.findByMongoId(account);
		return account;
	}

}
