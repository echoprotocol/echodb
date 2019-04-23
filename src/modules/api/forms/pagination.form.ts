import AbstractForm, { rule } from './abstract.form';
import * as API from '../../../constants/api.constants';
import * as Joi from 'joi';
import { ArgsType, Field, Int } from 'type-graphql';

// TODO: allow using limit: 0 in services with pagination
@ArgsType()
export default class PaginationForm extends AbstractForm {
	@rule(Joi.number().integer().min(0).max(API.PAGINATION.MAX_COUNT))
	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	count: number;

	@rule(Joi.number().integer().min(0))
	@Field(() => Int, { defaultValue: 0 })
	offset: number;
}
