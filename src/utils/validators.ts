import * as mongoose from 'mongoose';
import { validators } from 'echojs-lib';
import { AccountId, AssetId, ContractId } from '../types/echo';
import { IOperationRelation } from '../interfaces/IOperation';
import { ok } from 'assert';
import { removeDuplicates } from './common';

const { isAccountId, isContractId, isAssetId } = validators;

export function isMongoObjectId(value: string | number | any) {
	return mongoose.Types.ObjectId.isValid(value);
}

// FIXME: refactor to use keys
export type RelationParameters = {
	from: AccountId[],
	to?: AccountId | AccountId[],
	accounts?: AccountId[],
	contracts?: ContractId | ContractId[],
	assets: AssetId[],
	tokens?: ContractId | ContractId[],
};

export function relationResponse(
	{ from, to, accounts, contracts, assets, tokens }: RelationParameters,
): IOperationRelation {
	return {
		from: validateArray(from, isAccountId, {
			unique: true,
			canBeEmpty: false,
			canBeNotArray: false,
		}),
		to: validateArray(to, isAccountId, {
			unique: true,
			canBeEmpty: true,
			canBeNotArray: true,
		}),
		accounts: validateArray(accounts, isAccountId, {
			unique: true,
			canBeEmpty: true,
			canBeNotArray: false,
		}),
		contracts: validateArray(contracts, isContractId, {
			unique: true,
			canBeEmpty: true,
			canBeNotArray: true,
		}),
		assets: validateArray(assets, isAssetId, {
			unique: true,
			canBeEmpty: false,
			canBeNotArray: false,
		}),
		tokens: validateArray(tokens, isContractId, {
			unique: true,
			canBeEmpty: true,
			canBeNotArray: true,
		}),
	};
}

function validateArray<T>(
	value: T | T[],
	validator: (value: T) => boolean,
	{
		unique = true,
		canBeNotArray = true,
		canBeEmpty = false,
	} = {},
) {
	if (canBeEmpty && value === undefined) value = [];
	if (canBeNotArray) {
		if (value !== undefined && !Array.isArray(value)) value = [value];
	} else {
		ok(Array.isArray(value));
	}
	if (!canBeEmpty) {
		ok(Array.isArray(value));
		ok((<T[]>value).length > 0);
	}
	if (unique) value = removeDuplicates(<T[]>value);
	if (validator) {
		for (const v of value as T[]) {
			ok(validator(v));
		}
	}
	return <T[]>value;
}
