import { Document } from 'mongoose';

export interface IInfo {
	key: string;
	value: unknown;
}

export interface IInfoDocument extends IInfo, Document { }
