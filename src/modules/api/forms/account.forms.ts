import AbstractForm from './abstract.form';
import AccountId from '../types/account.id.type';
import * as API from '../../../constants/api.constants';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class AccountForm extends AbstractForm {
	@Field(() => AccountId, { nullable: true })
	id?: string;

	@Field({ nullable: true })
	name?: string;
}

@ArgsType()
export class AccountsForm extends AbstractForm {
	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	offset: number;
}
