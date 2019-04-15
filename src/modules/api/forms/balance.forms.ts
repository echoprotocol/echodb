import AbstractForm from './abstract.form';
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
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	offset: number;

	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;
}

@ArgsType()
export class BalanceSubscribe extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;

	@Field(() => ContractId, { nullable: true })
	contract: string;
}
