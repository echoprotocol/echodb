import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';

function check(value: string) {
	const regExpArr = value.match(/^1.14.\d+$/);
	if (!regExpArr || !regExpArr.length) throw new GraphQLError('');
	return value;
}

export default new GraphQLScalarType({
	name: 'ContractId',
	description: 'String. Format "1.14.\\d+"',
	parseValue(value: string) {
		if (typeof value !== 'string') throw new GraphQLError('');
		check(value);
		return value;
	},
	serialize(value: string) {
		return value;
	},
	parseLiteral(ast) {
		switch (ast.kind) {
			case Kind.STRING:
				check(ast.value);
				return ast.value;
				break;
			default:
				throw new GraphQLError('');
		}
	},
});
