import AbstractResolver from './abstract.resolver';
import { GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } from 'graphql';
import { blockType } from '../types/block.type';
import { PLACE } from '../../../../constants/graphql.constants';
import BlockService from '../../../../services/block.service';
import { GraphqlInitProps } from '../graphql.schema';

export default class BlockResolver extends AbstractResolver {

	constructor(
		readonly blockService: BlockService,
	) {
		super();
	}

	init({ addResolver, addProperty, addArgs }: GraphqlInitProps) {
		addResolver(
			PLACE.QUERY,
			'block',
			addArgs('id', new GraphQLNonNull(GraphQLString)),
			addProperty('type', blockType),
			addProperty('description', 'Get block by Id'),
			this.getBlock.bind(this),
		);

		addResolver(
			PLACE.QUERY,
			'blocks',
			addArgs('count', GraphQLInt),
			addArgs('offset', GraphQLInt),
			addProperty('type', new GraphQLList(blockType)),
			addProperty('description', 'Get blocks with pagination'),
			this.getBlocks.bind(this),
		);

	}

	async getBlock(_: any, { id }: { id: string }) {
		return this.blockService.getBlock(id);
	}

	async getBlocks(_:any, { count, offset }: { count: number, offset: number }) {
		return this.blockService.getBlocks(count, offset);
	}
}
