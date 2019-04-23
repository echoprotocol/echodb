import AbstractForm, { rule } from './abstract.form';
import ContractId from '../types/contract.id.type';
import AccountId from '../types/account.id.type';
import AssetId from '../types/asset.id.type';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

const uniqueArraySchema = Joi.array().items(Joi.string()).unique().max(100);

@ArgsType()
export class TransferSubscribeForm extends AbstractForm {
	@rule(uniqueArraySchema)
	@Field(() => AccountId, { nullable: true })
	from: string[];

	@rule(uniqueArraySchema)
	@Field(() => AccountId, { nullable: true })
	to: string[];

	@rule(uniqueArraySchema)
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(uniqueArraySchema)
	@Field(() => [AssetId], { nullable: true })
	assets: string[];
}
