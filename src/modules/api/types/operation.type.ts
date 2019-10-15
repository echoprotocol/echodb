import Transaction from './transaction.type';
import * as JsonType from 'graphql-type-json';
import { ObjectType, Field } from 'type-graphql';
import { MongoId } from 'types/mongoose';
import Block from './block.type';

@ObjectType()
export default class Operation {
	_tx: MongoId;

	@Field()
	id: string;

	@Field(() => JsonType)
	body: typeof JsonType;

	@Field({ nullable: true })
	result: string;

	@Field(() => Block, { nullable: true })
	block: MongoId;

	@Field({ nullable: true })
	virtual: boolean;

	@Field(() => Transaction, { nullable: true })
	transaction: Transaction;
}
