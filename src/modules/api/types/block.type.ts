import Account from './account.type';
import BlockCert from './block.cert.type';
import { ObjectType, Field } from 'type-graphql';
import Transaction from './transaction.type';
import { MongoId } from '../../../types/mongoose';

@ObjectType()
export default class Block {
	_id: MongoId;
	@Field() previous: string;
	@Field() timestamp: string;
	@Field() account: Account;
	@Field() delegate: Account;
	@Field() transaction_merkle_root: string;
	@Field() state_root_hash: string;
	@Field() result_root_hash: string;
	// FIXME: unknown type
	// @Field() extensions: unknown[];
	@Field() ed_signature: string;
	// FIXME: unknown type
	// @Field() verifications: unknown[];
	@Field() round: number;
	@Field() rand: string;
	@Field() cert: BlockCert;
	@Field() decentralization_rate: number;

	@Field(() => [Transaction])
	transactions: Transaction[];
}
