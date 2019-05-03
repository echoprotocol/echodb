import AbstractForm, { rule } from './abstract.form';
import AccountId from '../types/account.id.type';
import PaginationForm from './pagination.form';
import AssetId from '../types/asset.id.type';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class NewAssetSubscriptionForm extends AbstractForm {

	@rule(Joi.array().items(Joi.string()))
	@Field(() => [String], { nullable: true })
	symbols?: string[];

	@rule(Joi.array().items(Joi.string()).max(100).unique())
	@Field(() => [AccountId], { nullable: true })
	registrars?: string[];
}

@ArgsType()
export class GetAssetsForm extends PaginationForm {
	@rule(Joi.array().items(Joi.string()).max(100).unique())
	@Field(() => [String], { nullable: true })
	symbols: string[];

	@rule(Joi.array().items(Joi.string()).max(100).unique())
	@Field(() => [AssetId], { nullable: true })
	assets: string[];

	@rule(Joi.string())
	@Field(() => AccountId, { nullable: true })
	account: string;
}
