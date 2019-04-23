import { AccountId } from '../types/echo';
import { TDoc } from '../types/mongoose';
import { IAccount } from '../interfaces/IAccount';
import { IAsset } from '../interfaces/IAsset';
import { IBalance } from '../interfaces/IBalance';
import { IContractBalance } from '../interfaces/IContractBalance';
import { IBlock } from '../interfaces/IBlock';
import { IContract } from '../interfaces/IContract';
import { IOperation } from '../interfaces/IOperation';
import { ITransaction } from '../interfaces/ITransaction';

export enum EVENT {
	NEW_ASSET = 'new_asset',
	ASSET_UPDATED = 'asset_updated',
	NEW_ACCOUNT = 'new_account',
	NEW_BLOCK = 'new_block',
	NEW_BALANCE = 'new_balance',
	NEW_CONTRACT_BALANCE = 'new_contract_balance',
	NEW_TRANSACTION = 'new_transaction',
	NEW_OPERATION = 'new_operation',
	NEW_CONTRACT = 'new_contract',
	ACCOUNT_UPDATED = 'account_updated',
	ACCOUNT_OWNER_CHANGED = 'account_owner_changed',
	BALANCE_UPDATED = 'balance_updated',
	CONTRACT_BALANCE_UPDATED = 'contract_balance_updated',
}

export const EVENT_LIST = Object.values(EVENT);

// FIXME: use IBlock ?
export type EVENT_PAYLOAD = {
	[EVENT.NEW_ASSET]: TDoc<IAsset>;
	[EVENT.NEW_BLOCK]: TDoc<IBlock>;
	[EVENT.NEW_TRANSACTION]: TDoc<ITransaction>;
	[EVENT.NEW_OPERATION]: TDoc<IOperation>;
	[EVENT.NEW_ACCOUNT]: TDoc<IAccount>;
	[EVENT.NEW_BALANCE]: TDoc<IBalance>;
	[EVENT.NEW_CONTRACT_BALANCE]: TDoc<IContractBalance>;
	[EVENT.NEW_CONTRACT]: TDoc<IContract>;
	[EVENT.ASSET_UPDATED]: string; // asset id
	[EVENT.ACCOUNT_UPDATED]: AccountId;
	[EVENT.ACCOUNT_OWNER_CHANGED]: { old: AccountId, new: AccountId };
	[EVENT.BALANCE_UPDATED]: TDoc<IBalance>;
	[EVENT.CONTRACT_BALANCE_UPDATED]: TDoc<IContractBalance>;
};

export enum KEY {
	TEST = 'test',
}

export type  KEY_VALUE_TYPE = {
	[KEY.TEST]: string;
};

export enum CLIENT_ID {
	SUB,
	PUB,
	INFO,
}
