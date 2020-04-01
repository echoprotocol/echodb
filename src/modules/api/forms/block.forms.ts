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
@ArgsType()
export class ExtendedHistoryForm extends AbstractForm {
	@rule(Joi.date())
	@Field(() => String, { nullable: true })
	from: string;
	@rule(Joi.date())
	@Field(() => String, { nullable: true })
	to: string;
	@rule(Joi.number().positive())
	@Field(() => Int, { nullable: true })
	interval: number;
}
