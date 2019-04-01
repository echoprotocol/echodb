import * as Joi from 'joi';
import AbstractForm, { rule } from './abstract.form';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export default class TransactionForms extends AbstractForm {
	@Field(() => Int, { nullable: false })
	@rule(Joi.number())
	block: number;
}
