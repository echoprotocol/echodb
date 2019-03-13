import { Document } from 'mongoose';
import * as CONTRACT from '../constants/contract.constants';

export interface IContract {
	id: string;
	registrar: string;
	eth_accuracy: boolean;
	supported_asset_id: string;
	type: CONTRACT.TYPE;
}

// @ts-ignore
export interface IContractDocument extends IContract, Document {}
