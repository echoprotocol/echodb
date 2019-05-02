import Contract from './contract.type';
import StringifiedNumber from './string.number.type';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from '../../../types/mongoose';

@ObjectType()
export default class ContractBalance {
	_contract: MongoId;
	@Field() asset: string;
	@Field(() => StringifiedNumber) amount: string;
	@Field() contract: Contract;
}
