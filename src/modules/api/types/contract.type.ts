import Account from './account.type';
import ContractId from './contract.id.type';
import * as CONTRACT from '../../../constants/contract.constants';
import { IAccount } from '../../../interfaces/IAccount';
import { TDoc } from '../../../types/mongoose';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

registerEnumType(CONTRACT.TYPE, {
	name: 'ContractTypeEnum',
	description: 'Type of a contract',
});

@ObjectType()
export default class Contract {
	@Field(() => ContractId)
	id: string;

	_registrar: TDoc<IAccount>;
	@Field(() => Account)
	registrar: Account;

	@Field()
	eth_accuracy: boolean;

	@Field()
	supported_asset_id: string;

	@Field()
	type: CONTRACT.TYPE;
}
