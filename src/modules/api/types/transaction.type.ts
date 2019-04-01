import { ObjectType, Field } from 'type-graphql';
import { MongoId } from 'types/mongoose';
import Block from './block.type';

@ObjectType()
export default class TransactionType {
	_block: MongoId;
	@Field(() => Block) block: Block;
	@Field() ref_block_num: number;
	@Field() ref_block_prefix: number;
	@Field() expiration: string;
	// FIXME: unknown type
	// @Field() extensions: unknown;
	@Field(() => [String]) signatures: string[];
}
