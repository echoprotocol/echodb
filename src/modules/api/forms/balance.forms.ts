import AbstractForm, { rule } from './abstract.form';
import AccountId from '../types/account.id.type';
import ContractId from '../types/contract.id.type';
import * as BALANCE from '../../../constants/balance.constants';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class GetBalanceInForm extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => ContractId, { nullable: false })
	contract: string;
}

@ArgsType()
export class GetBalancesForm extends AbstractForm {
	@Field(() => [AccountId], { nullable: false })
	@rule(Joi.array().max(100))
	accounts: string[];

	@rule(Joi.string())
	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	@rule(Joi.string())
	type: BALANCE.TYPE;
}

@ArgsType()
export class BalanceSubscribeForm extends AbstractForm {
	@rule(Joi.array().max(100))
	@Field(() => [AccountId], { nullable: false })
	accounts: string[];

	@rule(Joi.string())
	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;

	@rule(Joi.string())
	@Field(() => ContractId, { nullable: true })
	contract: string;
}

@ArgsType()
export class BalanceSubscribe extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;

	@Field(() => ContractId, { nullable: true })
	contract: string;

	@Field(() => String, { nullable: true })
	asset: string;
}
