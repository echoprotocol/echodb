import AbstractRepository from './abstract.repository';
import BlockModel from '../models/block.model';
import RavenHelper from '../helpers/raven.helper';
import { IBlockDocument } from '../interfaces/IBlockDocument';

export default class BlockRepository extends AbstractRepository<IBlockDocument> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, BlockModel);
	}
}
