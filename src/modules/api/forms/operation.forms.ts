import { rule }  from './abstract.form';
import AccountId from '../types/account.id.type';
import ContractId from '../types/contract.id.type';
import PaginationForm from './pagination.form';
import * as ECHO from '../../../constants/echo.constants';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

const stringsArraySchema = Joi.array().items(Joi.string());

@ArgsType()
export class GetOperationsHistoryForm extends PaginationForm {
	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	from: string[];

	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	to: string[];

	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	accounts: string[];

	@rule(stringsArraySchema)
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(stringsArraySchema)
	@Field(() => [String], { nullable: true })
	assets: string[];

	@rule(stringsArraySchema)
	@Field(() => [ContractId], { nullable: true })
	tokens: string[];

	@rule(Joi.array().items(Joi.number()))
	@Field(() => [ECHO.OPERATION_ID], { nullable: true })
	operations: ECHO.OPERATION_ID[];
}
