import AbstractForm, { rule } from './abstract.form';
import * as Joi from 'joi';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class HistoryForm extends AbstractForm {
	@rule(Joi.date().iso())
	@Field(() => String, { nullable: true, description: 'Expect ISO format' })
	from?: string;
	@rule(Joi.date().iso())
	@Field(() => String, { nullable: true, description: 'Expect ISO format' })
	to?: string;
}

@ArgsType()
export class ExtendedHistoryForm extends HistoryForm {
	@rule(Joi.number().positive())
	@Field(() => Int, { nullable: true, description: 'Expect second number format' })
	interval?: number;
}
