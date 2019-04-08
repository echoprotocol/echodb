import { Document } from 'mongoose';
import { AccountId, AssetId } from '../types/echo';

export interface IMemo {
	from: string;
	to: string;
	nonce: string;
	message: string;
}

export interface ITransfer {
	_from: AccountId;
	_to: AccountId;
	amount: number;
	_asset: AssetId;
	memo?: IMemo;
}

// @ts-ignore
export interface ITransferDocument extends ITransfer, Document {}
