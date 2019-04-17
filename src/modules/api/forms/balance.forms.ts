import * as Joi from 'joi';
import AbstractForm, { rule } from './abstract.form';
import ContractId from '../types/contract.id.type';
import AccountId from '../types/account.id.type';
import * as API from '../../../constants/api.constants';
import * as BALANCE from '../../../constants/balance.constants';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class BalanceInForm extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => ContractId, { nullable: false })
	contract: string;
}

@ArgsType()
export class BalancesForm extends AbstractForm {
	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	@rule(Joi.number().max(API.PAGINATION.MAX_COUNT))
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	@rule(Joi.number())
	offset: number;

	@Field(() => [AccountId], { nullable: false })
	@rule(Joi.array().max(100))
	accounts: string[];

	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	@rule(Joi.string())
	type: BALANCE.TYPE;
}

@ArgsType()
export class BalanceSubscribe extends AbstractForm {
	@Field(() => [AccountId], { nullable: false })
	accounts: string[];

	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;

	@Field(() => ContractId, { nullable: true })
	contract: string;
}
