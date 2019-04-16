import AbstractForm, { rule } from './abstract.form';
import AccountId from '../types/account.id.type';
import ContractId from '../types/contract.id.type';
import PaginationForm from './pagination.form';
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
export class GetBalancesForm extends PaginationForm {
	@rule(Joi.string())
	@Field(() => AccountId, { nullable: false })
	account: string;

	@rule(Joi.string())
	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;
}

@ArgsType()
export class BalanceSubscribeForm extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;

	@Field(() => ContractId, { nullable: true })
	contract: string;
}
