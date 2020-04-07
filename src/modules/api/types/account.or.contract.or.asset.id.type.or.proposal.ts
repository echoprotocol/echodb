import { validators, constants } from 'echojs-lib';
import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';

function check(value: string) {
	if (!validators.isAccountId(value)
		&& !validators.isContractId(value)
		&& !validators.isAssetId(value)
		&& !validators.isProposalId(value)
	) throw new GraphQLError('');
	return value;
}

const accountTypeId = constants.PROTOCOL_OBJECT_TYPE_ID.ACCOUNT;
const assetTypeId = constants.PROTOCOL_OBJECT_TYPE_ID.ASSET;
const contractTypeId = constants.PROTOCOL_OBJECT_TYPE_ID.CONTRACT;
const proposalTypeId = constants.PROTOCOL_OBJECT_TYPE_ID.PROPOSAL;

export default new GraphQLScalarType({
	name: 'AccountOrContractOrAssetOrProposalId',
	description: `String. Format "1.(${accountTypeId}|${contractTypeId}|${assetTypeId}|${proposalTypeId}).\\d+"`,
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
