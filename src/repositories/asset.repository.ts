import AbstractRepository from './abstract.repository';
import RavenHelper from 'helpers/raven.helper';
import AssetModel from '../models/asset.model';
import { IAsset } from '../interfaces/IAsset';

export default class AssetRepository extends AbstractRepository<IAsset> {

	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, AssetModel);
	}

	findById(id: string) {
		return super.findOne({ id });
	}

}
