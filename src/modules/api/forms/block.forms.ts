import AbstractForm, { rule } from './abstract.form';
import PaginationForm from './pagination.form';
import * as Joi from 'joi';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class GetBlockForm extends AbstractForm {
	@rule(Joi.number().positive())
	@Field(() => Int, { nullable: false })
	round: number;
}

@ArgsType()
export class GetBlocksForm extends PaginationForm {}
