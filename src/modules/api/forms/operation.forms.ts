import * as Joi from 'joi';
import AbstractForm, { rule }  from './abstract.form';
import ContractId from '../types/contract.id.type';
import AccountId from '../types/account.id.type';
import * as API from '../../../constants/api.constants';
import * as ECHO from '../../../constants/echo.constants';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export default class OperationForms extends AbstractForm {
	@Field(() => [AccountId], { nullable: true })
	from: string[];

	@Field(() => [AccountId], { nullable: true })
	to: string[];

	@Field(() => [AccountId], { nullable: true })
	accounts: string[];

	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@Field(() => [String], { nullable: true })
	assets: string[];

	@Field(() => [ContractId], { nullable: true })
	tokens: string[];

	@Field(() => [ECHO.OPERATION_ID], { nullable: true })
	operations: ECHO.OPERATION_ID[];

	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	@rule(Joi.number().max(API.PAGINATION.MAX_COUNT))
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	@rule(Joi.number())
	offset: number;
}
