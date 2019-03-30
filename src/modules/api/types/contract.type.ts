import 'reflect-metadata';
import Account from './account.type';
import * as CONTRACT from '../../../constants/contract.constants';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

registerEnumType(CONTRACT.TYPE, {
	name: 'ContractTypeEnum',
	description: 'Type of a contract',
});

@ObjectType()
export default class Contract {
	@Field()
	id: string;

	@Field()
	registrar: Account;

	@Field()
	eth_accuracy: boolean;

	@Field()
	supported_asset_id: string;

	@Field()
	type: CONTRACT.TYPE;
}
