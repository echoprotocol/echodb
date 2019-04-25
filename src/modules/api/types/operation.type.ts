import Transaction from './transaction.type';
import * as JsonType from 'graphql-type-json';
import * as ECHO from '../../../constants/echo.constants';
import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { MongoId } from 'types/mongoose';

registerEnumType(ECHO.OPERATION_ID, {
	name: 'OperationIdEnum',
	description: 'Type of an operation',
});

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
