import AbstractRepository from './abstract.repository';
import IERC20Token from '../interfaces/IERC20Token';
import RavenHelper from '../helpers/raven.helper';
import erc20TokenModel from '../models/erc20-token.model';

export default class ERC20TokenRepository extends AbstractRepository<IERC20Token> {
	constructor(ravenHelper: RavenHelper) { super(ravenHelper, erc20TokenModel); }
}
