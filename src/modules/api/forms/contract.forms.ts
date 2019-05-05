import AbstractForm from './abstract.form';
import AccountId from '../types/account.id.type';
import ContractId from '../types/contract.id.type';
import PaginationForm from './pagination.form';
import * as CONTRACT from '../../../constants/contract.constants';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class GetContractForm extends AbstractForm {
	@Field(() => ContractId, { nullable: false })
	id: string;
}

@ArgsType()
export class GetContractsForm extends PaginationForm {
	@Field(() => [AccountId], { nullable: true })
	registrars?: string[];

	@Field(() => CONTRACT.TYPE, { nullable: true })
	type?: CONTRACT.TYPE;
}

@ArgsType()
export class NewContractSubscribeForm extends AbstractForm {
	@Field(() => CONTRACT.TYPE, { nullable: true })
	contractType: CONTRACT.TYPE;
}

@ArgsType()
export class ContractHistoryUpdatedSubscribeForm extends AbstractForm {
	@Field(() => [ContractId], { nullable: false })
	contracts: string[];
}
