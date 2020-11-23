import * as Joi from 'joi';
import AbstractForm, { rule } from './abstract.form';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class GetTransactionsByBlockForm extends AbstractForm {
	@Field(() => Int, { nullable: false })
	@rule(Joi.number())
	block: number;
}

@ArgsType()
export class GetTransactionsByBlockAndPositionForm extends AbstractForm {
	@Field(() => Int, { nullable: false })
	@rule(Joi.number())
	block: number;

	@Field(() => Int, { nullable: false })
	@rule(Joi.number().integer().min(0))
	trxInBlock: number;
}

@ArgsType()
export class GetTransactionsByHexForm extends AbstractForm {
	@Field(() => String, { nullable: false })
	@rule(Joi.string().length(20))
	trx_hex: string;
}
