import AbstractForm, { rule } from './abstract.form';
import AccountId from '../types/account.id.type';
import AssetId from '../types/asset.id.type';
import ContractId from '../types/contract.id.type';
import SubjectTypes from '../types/account.or.contract.or.asset.id.type';
import PaginationForm from './pagination.form';
import * as ECHO from '../../../constants/echo.constants';
import * as API from '../../../constants/api.constants';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';
import AccountOrContractOrAssetIdTypeOrProposal from '../types/account.or.contract.or.asset.id.type.or.proposal';

const stringsArraySchema = Joi.array().items(Joi.string()).max(100).unique();

@ArgsType()
export class QueryOptions extends PaginationForm {
	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	accounts: string[];

	@rule(stringsArraySchema)
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(stringsArraySchema)
	@Field(() => [AssetId], { nullable: true })
	assets: string[];

	@rule(stringsArraySchema)
	@Field(() => [ContractId], { nullable: true })
	tokens: string[];

	@rule(Joi.array().items(Joi.number()))
	@Field(() => [ECHO.OPERATION_ID], { nullable: true })
	operations: ECHO.OPERATION_ID[];

	@rule(Joi.string().valid(API.SORT_DESTINATION.ASC, API.SORT_DESTINATION.DESC))
	@Field(() => API.SORT_DESTINATION, { defaultValue: API.SORT_DESTINATION.DESC })
	sort: API.SORT_DESTINATION;
}
@ArgsType()
export class GetOperationsHistoryForm extends QueryOptions {
	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	from: string[];

	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	to: string[];
}

@ArgsType()
export class GetSubjectOperation extends QueryOptions {
	@rule(Joi.string())
	@Field(() => SubjectTypes, { nullable: false })
	subject: string;

	@rule(Joi.string())
	@Field(() => AccountOrContractOrAssetIdTypeOrProposal, { nullable: true })
	fromFilter: string;

	@rule(Joi.string())
	@Field(() => AccountOrContractOrAssetIdTypeOrProposal, { nullable: true })
	toFilter: string;
}

@ArgsType()
export class NewOperationSubscribe extends AbstractForm {
	@rule(stringsArraySchema)
	@Field(() => [AccountId], { nullable: true })
	accounts: string[];

	@rule(stringsArraySchema)
	@Field(() => [ContractId], { nullable: true })
	tokens: string[];

	@rule(stringsArraySchema)
	@Field(() => [AssetId], { nullable: true })
	assets: string[];

	@rule(Joi.array().items(Joi.number()))
	@Field(() => [ECHO.OPERATION_ID], { nullable: true })
	operations: ECHO.OPERATION_ID[];
}
