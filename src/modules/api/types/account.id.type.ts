import { validators, constants } from 'echojs-lib';
import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';

function check(value: string) {
	if (!validators.isAccountId(value)) throw new GraphQLError('');
	return value;
}

export default new GraphQLScalarType({
	name: 'AccountId',
	description: `String. Format "1.${constants.PROTOCOL_OBJECT_TYPE_ID.ACCOUNT}.\\d+"`,
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
