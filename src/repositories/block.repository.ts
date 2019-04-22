import AbstractRepository from './abstract.repository';
import BlockModel from '../models/block.model';
import RavenHelper from '../helpers/raven.helper';
import { IBlock } from '../interfaces/IBlock';

export default class BlockRepository extends AbstractRepository<IBlock> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, BlockModel);
	}

	findByRound(round: number) {
		return super.findOne({ round });
	}

}
