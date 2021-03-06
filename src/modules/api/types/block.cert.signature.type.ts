import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class BlockSignature {
	@Field() _step: number;
	@Field() _value: number;
	@Field() _signer: number;
	@Field() _bba_sign: string;
}
