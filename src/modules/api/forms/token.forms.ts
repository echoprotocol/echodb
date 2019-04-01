import AbstractForm from './abstract.form';
import AccountId from '../types/account.id.type';
import * as API from '../../../constants/api.constants';
import * as TOKEN from '../../../constants/token.constants';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class TokensForm extends AbstractForm {
	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	offset: number;

	@Field(() => AccountId, { nullable: true })
	registrar?: string;

	@Field(() => TOKEN.TYPE, { nullable: true })
	type?: TOKEN.TYPE;

	@Field({ nullable: true, description: 'you can use regex here' })
	name: string;

	@Field({ nullable: true })
	symbol?: string;
}
