import { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLID } from 'graphql';

export const blockType = new GraphQLObjectType({
	name: 'Block',
	description: 'Blocks from echo',
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLID) },
		cert: { type: certType },
		rand: { type: GraphQLString },
		account: { type: GraphQLString },
		round: { type: GraphQLInt },
		witness_signature: { type: GraphQLString },
		timestamp: { type: GraphQLString },
		transaction_merkle_root: { type: GraphQLString },
		previous: { type: GraphQLString },
		ed_signature: { type: GraphQLString },
		witness: { type: GraphQLString },
	}),
});

const certType = new GraphQLObjectType({
	name: 'Cert',
	fields: () => ({
		_rand: { type: GraphQLString },
		_block_hash: { type: GraphQLString },
		_producer: { type: GraphQLInt },
		_signatures: { type: new GraphQLList(signature) },
	}),
});

const signature = new GraphQLObjectType({
	name: 'Signature',
	fields: () => ({
		_step: { type: GraphQLInt },
		_value: { type: GraphQLInt },
		_signer: { type: GraphQLInt },
		_bba_sign: { type: GraphQLString },
	}),
});
