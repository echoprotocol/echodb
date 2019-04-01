import AbstractRepository from './abstract.repository';
import BlockModel from '../models/block.model';
import RavenHelper from '../helpers/raven.helper';
import { IBlock } from '../interfaces/IBlock';
import { MongoId } from '../types/mongoose';

export default class BlockRepository extends AbstractRepository<IBlock> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, BlockModel);
	}

	findByMongoId(id: MongoId) {
		return super.findById(id);
	}
}
