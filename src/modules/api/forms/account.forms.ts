import AbstractForm, { rule } from './abstract.form';
import PaginationForm from './pagination.form';
import AccountId from '../types/account.id.type';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class GetAccountForm extends AbstractForm {
	@rule(Joi.string())
	@Field(() => AccountId, { nullable: true })
	id?: string;

	@rule(Joi.string())
	@Field({ nullable: true })
	name?: string;

	static readonly description = 'It accepts one of two parameters (either id or name)';
	static append(schema: Joi.ObjectSchema) {
		return schema.without('id', 'name');
	}
}

@ArgsType()
export class GetAccountsForm extends PaginationForm {
	@rule(Joi.string().max(100))
	@Field(() => String, { nullable: true })
	name: string;
}

@ArgsType()
export class AccountHistoryUpdatedSubscriptionForm {
	@Field(() => [AccountId], { nullable: false })
	accounts: string[];
}
