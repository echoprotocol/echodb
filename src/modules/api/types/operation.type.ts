import Transaction from './transaction.type';
import * as JsonType from 'graphql-type-json';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from 'types/mongoose';

@ObjectType()
export default class Operation {
	_tx: MongoId;

	@Field()
	id: string;

	@Field(() => JsonType)
	body: typeof JsonType;

	@Field({ nullable: true })
	result: string;

	@Field(() => Transaction)
	transaction: Transaction;
}
