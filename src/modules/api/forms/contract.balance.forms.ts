import AbstractForm, { rule } from './abstract.form';
import ContractId from '../types/contract.id.type';
import PaginationForm from './pagination.form';
import * as CONTRACT from '../../../constants/contract.constants';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class GetContractBalancesForm extends PaginationForm {
	@rule(Joi.array().max(100).items(Joi.string()).unique())
	@Field(() => [ContractId], { nullable: false })
	contracts: string[];

	// TODO: add assets filter
}

@ArgsType()
export class ContractBalanceSubscribeForm extends AbstractForm {
	@rule(Joi.array().items(Joi.string()).max(100))
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(Joi.string())
	@Field(() => CONTRACT.TYPE, { nullable: true })
	type: CONTRACT.TYPE;

	static append(schema: Joi.ObjectSchema) {
		return schema.xor('contracts', 'type');
	}
}
