import * as CONTRACT from '../constants/contract.constants';
import { Document } from 'mongoose';
import { MongoId } from '../types/mongoose';

export interface IContract {
	id: string;
	_registrar: MongoId;
	eth_accuracy: boolean;
	supported_asset_id: string;
	type: CONTRACT.TYPE;
}

// @ts-ignore
export interface IContractDocument extends IContract, Document {}
