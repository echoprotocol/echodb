import { ObjectType, Field } from 'type-graphql';
import { BlockFrozenData } from './block.type';

@ObjectType()
class FrozenBalancesMap {
	@Field() startIntervalDateString: string;
	@Field() frozenSums: BlockFrozenData;
}

@ObjectType()
export class FrozenBalancesData {
	@Field(() => [FrozenBalancesMap]) frozenData: FrozenBalancesMap[];
}

@ObjectType()
export class CurrentFrozenBalancesData {
	@Field(() => BlockFrozenData) currentFrozenData: BlockFrozenData;
}
