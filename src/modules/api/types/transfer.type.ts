import Account from '../types/account.type';
import Contract from '../types/contract.type';
import Asset from '../types/asset.type';
import StringifiedNumber from './string.number.type';
import * as BALANCE from '../../../constants/balance.constants';
import * as TRANSFER from '../../../constants/transfer.constants';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';
import Fee from './fee.type';

@ObjectType()
export default class Transfer {
	relationType: TRANSFER.TYPE;
	valueType: BALANCE.TYPE;
	_fromAccount: MongoId;
	_fromContract: MongoId;
	_toAccount: MongoId;
	_toContract: MongoId;
	_asset: MongoId;
	_contract: MongoId;
	@Field() block: number;
	@Field() operationId: number;
	@Field() trx_in_block: number;
	@Field() op_in_trx: number;
	@Field() virtual: boolean;
	@Field() timestamp: Date;
	@Field(() => Account) from: string;
	@Field(() => Account) to: string;
	@Field(() => StringifiedNumber) amount: string;
	@Field(() => Asset, { nullable: true }) asset: Asset;
	@Field(() => Fee) fee: Fee;
	@Field(() => Contract, { nullable: true }) contract: string;
	@Field(() => BALANCE.TYPE) type: BALANCE.TYPE;
	@Field(() => TRANSFER.TYPE) relation: TRANSFER.TYPE;
}
