import AbstractRepository from './abstract.repository';
import RavenHelper from 'helpers/raven.helper';
import ERC20InfoModel from '../models/erc20.info.model';
import { IERC20Info } from '../interfaces/IERC20Info';

export default class ERC20InfoRepository extends AbstractRepository<IERC20Info> {

	constructor(ravenHelper: RavenHelper) {
		super(ravenHelper, ERC20InfoModel);
	}

}
