import AbstractRepository from './abstract.repository';
import ContractModel from '../models/contract.model';
import RavenHelper from '../helpers/raven.helper';
import { IContract } from 'interfaces/IContract';

export default class BlockRepository extends AbstractRepository<IContract> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, ContractModel);
	}
}
