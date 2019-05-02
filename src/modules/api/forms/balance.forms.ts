import AbstractForm, { rule } from './abstract.form';
import AssetId from '../types/asset.id.type';
import AccountId from '../types/account.id.type';
import ContractId from '../types/contract.id.type';
import * as BALANCE from '../../../constants/balance.constants';
import * as Joi from 'joi';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class GetBalanceInTokenForm extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => ContractId, { nullable: false })
	contract: string;
}

@ArgsType()
export class GetBalanceInAssetForm extends AbstractForm {
	@Field(() => AccountId, { nullable: false })
	account: string;

	@Field(() => AssetId, { nullable: false })
	asset: string;
}

@ArgsType()
export class GetBalancesForm extends AbstractForm {
	@Field(() => [AccountId], { nullable: false })
	@rule(Joi.array().max(100))
	accounts: string[];

	@rule(Joi.string())
	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;
}

@ArgsType()
export class BalanceSubscribeForm extends AbstractForm {
	@rule(Joi.array().items(Joi.string()).max(100).unique())
	@Field(() => [AccountId], { nullable: false })
	accounts: string[];

	@rule(Joi.string())
	@Field(() => BALANCE.TYPE, { nullable: true, description: 'balance type' })
	type: BALANCE.TYPE;

	@rule(Joi.array().items(Joi.string()).max(100).unique().when('type', {
		is: BALANCE.TYPE.TOKEN,
		then: Joi.forbidden(),
	}))
	@Field(() => [ContractId], { nullable: true })
	contracts: string[];

	@rule(Joi.array().items(Joi.string()).max(100).unique().when('type', {
		is: BALANCE.TYPE.ASSET,
		then: Joi.forbidden(),
	}))
	@Field(() => [AssetId], { nullable: true })
	assets: string[];
}
