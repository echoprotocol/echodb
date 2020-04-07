import { ObjectType, Field } from 'type-graphql';
import { BlockFrozenData } from './block.type';

@ObjectType()
class FrozenBalancesMap {
	@Field() startIntervalDateString: string;
	@Field() frozenSums: BlockFrozenData;
}

@ObjectType()
export default class FrozenBalancesData {
	@Field(() => BlockFrozenData) currentFrozenData: BlockFrozenData;
	@Field(() => [FrozenBalancesMap]) frozenData: FrozenBalancesMap[];
}
