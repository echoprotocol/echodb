import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';
import BN from 'bignumber.js';

export default new GraphQLScalarType({
	name: 'StringifiedNumber',
	description: 'Number that converted to string',
	parseValue(value: string | number) {
		if (typeof value !== 'string' || typeof value !== 'number') throw new GraphQLError('');
		return new BN(value).toString();
	},
	serialize(value: string) {
		return new BN(value).toString(10);
	},
	parseLiteral(ast) {
		switch (ast.kind) {
			case Kind.STRING:
				new BN(ast.value).toString();
				break;
			case Kind.INT:
				return new BN(ast.value).toString();
				break;
			case Kind.FLOAT:
				return new BN(ast.value).toString();
				break;
			default:
				throw new GraphQLError('');
		}
	},
});
