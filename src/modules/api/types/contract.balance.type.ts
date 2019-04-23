import Contract from './contract.type';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';

@ObjectType()
export default class ContractBalance {
	_contract: MongoId;
	@Field() asset: string;
	@Field() amount: string;
	@Field() contract: Contract;
}
