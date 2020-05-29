import AbstractForm, { rule } from './abstract.form';
import AssetId from '../types/asset.id.type';
import PaginationForm from './pagination.form';
import AccountId from '../types/account.id.type';
import ContractId from '../types/contract.id.type';
import ContractOrAssetId from '../types/contract.or.asset.id.type';

import AccountOrContractId from '../types/account.or.contract.id.type';
import StringNumber from '../types/string.number.type';
import * as API from '../../../constants/api.constants';
import * as BALANCE from '../../../constants/balance.constants';
import * as TRANSFER from '../../../constants/transfer.constants';

import * as Joi from 'joi';
import { ArgsType, Field, Int } from 'type-graphql';

const uniqueArraySchema = Joi.array().items(Joi.string()).unique().max(100);

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

@ArgsType()
export class GetTransfersHistoryForm extends PaginationForm {
	@rule(uniqueArraySchema)
	@Field(() => [AccountOrContractId], { nullable: true })
	from: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AccountOrContractId], { nullable: true })
	to: string[];

	@rule(uniqueArraySchema)
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AssetId], { nullable: true })
	assets: string[];

	@rule(Joi.array().items(Joi.string()))
	@Field(() => [TRANSFER.TYPE], { nullable: true })
	relationTypes: TRANSFER.TYPE[];

	@rule(Joi.array().items(Joi.string()))
	@Field(() => [BALANCE.TYPE], { nullable: true })
	valueTypes: BALANCE.TYPE[];

	@rule(uniqueArraySchema)
	@Field(() => [StringNumber], { nullable: true })
	amounts: string[];

	@rule(Joi.string().valid(API.SORT_DESTINATION.ASC, API.SORT_DESTINATION.DESC))
	@Field(() => API.SORT_DESTINATION, { defaultValue: API.SORT_DESTINATION.DESC })
	sort: API.SORT_DESTINATION;
}

@ArgsType()
export class GetTransfersHistoryDataWithInterval extends AbstractForm {
	@rule(Joi.number().positive())
	@Field(() => Int, { nullable: true, description: 'Expect second number format' })
	interval?: number;

	@rule(Joi.date().iso())
	@Field(() => String, { nullable: true, description: 'Expect ISO format' })
	from?: string;

	@rule(Joi.date().iso())
	@Field(() => String, { nullable: true, description: 'Expect ISO format' })
	to?: string;

	@rule(Joi.string().required())
	@Field(() => ContractOrAssetId, { nullable: false })
	targetSubject: string;
}
