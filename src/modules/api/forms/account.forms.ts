import AbstractForm, { rule } from './abstract.form';
import PaginationForm from './pagination.form';
import AccountId from '../types/account.id.type';
import * as API from '../../../constants/api.constants';
import * as COMMITTEE from '../../../constants/committee.constants';
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
export class GetAccountConditionForm extends AbstractForm {
	@rule(Joi.string())
	@Field(() => AccountId)
	id: string;

	@rule(Joi.date().iso())
	@Field(() => String, { nullable: false, description: 'Expect ISO format' })
	timestamp: string;
}

@ArgsType()
export class GetAccountsForm extends PaginationForm {
	@rule(Joi.string().max(100))
	@Field(() => String, { nullable: true })
	name: string;
}

@ArgsType()
export class GetAccountsWithUnrequiredSortsForm extends GetAccountsForm {
	@rule(Joi.string().valid(API.SORT_DESTINATION.ASC, API.SORT_DESTINATION.DESC))
	@Field(() => API.SORT_DESTINATION, {
		nullable: true,
		description: 'balance concentration rate sort has high priority between sorts',
	})
	concentrationBalanceRateSort: API.SORT_DESTINATION;

	@rule(Joi.string().valid(API.SORT_DESTINATION.ASC, API.SORT_DESTINATION.DESC))
	@Field(() => API.SORT_DESTINATION, {
		nullable: true,
		description: 'history concentration rate sort has low priority between sorts',
	})
	concentrationHistroyRateSort: API.SORT_DESTINATION;
}

@ArgsType()
export class GetCommetteeAccounts extends PaginationForm {
	@rule(Joi.string().valid(Object.values(COMMITTEE.STATUS)))
	@Field(() => String, {
		nullable: true,
		description: 'status of the member: active, deactivated, candidate or none',
	})
	status: COMMITTEE.STATUS;
}

@ArgsType()
export class AccountHistoryUpdatedSubscriptionForm {
	@Field(() => [AccountId], { nullable: false })
	accounts: string[];
}
