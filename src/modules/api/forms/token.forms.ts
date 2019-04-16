import AccountId from '../types/account.id.type';
import PaginationForm from './pagination.form';
import * as Joi from 'joi';
import * as TOKEN from '../../../constants/token.constants';
import { rule } from './abstract.form';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class GetTokensForm extends PaginationForm {
	@rule(Joi.string())
	@Field(() => AccountId, { nullable: true })
	registrar?: string;

	@rule(Joi.string())
	@Field(() => TOKEN.TYPE, { nullable: true })
	type?: TOKEN.TYPE;

	@rule(Joi.string())
	@Field({ nullable: true, description: 'partial matching' })
	name?: string;

	@rule(Joi.string())
	@Field({ nullable: true })
	symbol?: string;
}
