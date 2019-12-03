import AbstractRepository from './abstract.repository';
import IContractCaller from '../interfaces/IContractCaller';
import RavenHelper from '../helpers/raven.helper';
import contractCallerModel from '../models/contract.caller.model';

export default class ContractCallerRepository extends AbstractRepository<IContractCaller> {
	constructor(ravenHelper: RavenHelper) { super(ravenHelper, contractCallerModel); }
}
