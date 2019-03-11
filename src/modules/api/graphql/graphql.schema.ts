import { GraphQLObjectType, GraphQLSchema as Schema, GraphQLType, GraphQLFieldConfigMap } from 'graphql';
import BlockResolver from './resolvers/block.resolver';
import * as GRAPHQL from '../../../constants/graphql.constants';

export type GraphqlInitProps = {
	addResolver: GraphqlSchema['addResolver'],
	addProperty: GraphqlSchema['addProperty'],
	addArgs: GraphqlSchema['addArgs'],
};

export default class GraphqlSchema {

	private _schema: Schema;

	private places: {[x in GRAPHQL.PLACE]?: GraphQLFieldConfigMap<any, any>} = {};

	constructor(
		readonly blockResolver: BlockResolver,
	) {}

	init() {
		const resolvers = [
			this.blockResolver,
		];

		const properties = {
			addResolver: this.addResolver.bind(this),
			addProperty: this.addProperty.bind(this),
			addArgs: this.addArgs.bind(this),
		};

		for (const resolver of resolvers) {
			resolver.init(properties);
		}

		const queryRootType = new GraphQLObjectType({
			name: 'EchoSchema',
			description: 'Convenient interface to Echo blockchain data',
			fields: () => this.places[GRAPHQL.PLACE.QUERY],
		});

		this._schema = new Schema({
			query: queryRootType,
			// TODO: Add mutation
		});

		return this._schema;
	}

	addResolver(place: GRAPHQL.PLACE, route: string, ...unprocessedArgs: Function[]) {
		const { PROPERTY_KEY: { ARGS } } = GRAPHQL;

		const method = unprocessedArgs.pop();

		const properties = unprocessedArgs.reduce((obj, fn) => {
			const result = fn();
			if (result[ARGS]) {
				obj[ARGS] = { ...obj[ARGS], ...result[ARGS] };
				return obj;
			}
			return { ...obj, ...result };
		}, { [ARGS]: {} });

		if (!this.places[place]) {
			this.places[place] = {};
		}

		this.places[place][route] = {
			...properties,
			resolve: method,
		};
	}

	addArgs(field: string, type: GraphQLType) {
		const { PROPERTY_KEY: { ARGS } } = GRAPHQL;
		return this.addProperty(ARGS, this.addProperty(field, { type })());
	}

	addProperty(key: string, value: unknown) {
		return () => {
			return { [key]: value };
		};
	}
}
