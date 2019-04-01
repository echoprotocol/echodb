import BlockSignatureSignature from './block.cert.signature.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class BlockCert {
	@Field() _rand: string;
	@Field() _block_hash: string;
	@Field() _producer: number;

	@Field(() => [BlockSignatureSignature])
	_signatures: BlockSignatureSignature[];
}
