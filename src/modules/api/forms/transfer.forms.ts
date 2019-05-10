import AbstractForm, { rule } from './abstract.form';
import ContractId from '../types/contract.id.type';
import AccountId from '../types/account.id.type';
import AssetId from '../types/asset.id.type';
import PaginationForm from './pagination.form';
import * as Joi from 'joi';
import * as API from '../../../constants/api.constants';
import { ArgsType, Field } from 'type-graphql';

const uniqueArraySchema = Joi.array().items(Joi.string()).unique().max(100);

@ArgsType()
export class GetTransferHistoryForm extends PaginationForm {
	@rule(uniqueArraySchema)
	@Field(() => [AccountId], { nullable: true })
	from: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AccountId], { nullable: true })
	to: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AccountId], { nullable: true })
	accounts: string[];

	@rule(uniqueArraySchema)
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AssetId], { nullable: true })
	assets: string[];

	@rule(uniqueArraySchema)
	@Field(() => [ContractId], { nullable: true })
	tokens: string[];

	@rule(Joi.string().valid(API.SORT_DESTINATION.ASC, API.SORT_DESTINATION.DESC))
	@Field(() => API.SORT_DESTINATION, { defaultValue: API.SORT_DESTINATION.DESC })
	sort: API.SORT_DESTINATION;
}

@ArgsType()
export class TransferSubscribeForm extends AbstractForm {
	@rule(uniqueArraySchema)
	@Field(() => [AccountId, ContractId], { nullable: true })
	from: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AccountId, ContractId], { nullable: true })
	to: string[];

	@rule(uniqueArraySchema)
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AssetId], { nullable: true })
	assets: string[];
}
