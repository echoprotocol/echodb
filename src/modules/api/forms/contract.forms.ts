import AbstractForm from './abstract.form';
import ContractId from '../types/contract.id.type';
import AccountId from '../types/account.id.type';
import * as API from '../../../constants/api.constants';
import * as CONTRACT from '../../../constants/contract.constants';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class ContractForm extends AbstractForm {
	@Field(() => ContractId, { nullable: false })
	id: string;
}

@ArgsType()
export class ContractsForm extends AbstractForm {
	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	offset: number;

	@Field(() => [AccountId], { nullable: true })
	registrars?: string[];

	@Field(() => CONTRACT.TYPE, { nullable: true })
	type?: CONTRACT.TYPE;
}
