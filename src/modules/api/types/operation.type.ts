import * as JsonType from 'graphql-type-json';
import * as ECHO from '../../../constants/echo.constants';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

registerEnumType(ECHO.OPERATION_ID, {
	name: 'OperationIdType',
	description: 'Type of an operation',
});

@ObjectType()
export default class Operation {
	@Field()
	id: string;

	@Field(() => JsonType)
	body: typeof JsonType;

	@Field({ nullable: true })
	result: string;
}
