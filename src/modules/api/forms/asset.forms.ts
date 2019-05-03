import PaginationForm from './pagination.form';
import AssetId from '../types/asset.id.type';
import AccountId from '../types/account.id.type';
import * as Joi from 'joi';
import { rule } from './abstract.form';
import { ArgsType, Field } from 'type-graphql';

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
