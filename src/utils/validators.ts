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
	to?: AccountId,
	accounts?: AccountId[],
	contract?: ContractId,
	assets: AssetId[],
	token?: ContractId,
};

export function relationResponse(
	{ from, to, accounts, contract, assets, token }: RelationParameters,
): IOperationRelation {
	ok(from.length > 0);
	if (from.length > 1) from = removeDuplicates(from);
	for (const account of from) ok(isAccountId(account));
	if (to) ok(isAccountId(to));
	if (contract) ok(isContractId(contract));
	if (assets) {
		ok(assets.length > 0);
		if (assets.length > 1) assets = removeDuplicates(assets);
		for (const asset of assets) ok(isAssetId(asset));
	}
	if (accounts) {
		if (accounts.length > 1) accounts = removeDuplicates(accounts);
		for (const account of accounts) ok(isAccountId(account));
	}
	if (token) ok(isContractId(token));
	return {
		from,
		assets,
		accounts: accounts || [],
		to: to || null,
		contract: contract || null,
		token: token || null,
	};
}
