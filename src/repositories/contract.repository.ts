import AbstractRepository from './abstract.repository';
import ContractModel from '../models/contract.model';
import RavenHelper from '../helpers/raven.helper';
import { IContract } from 'interfaces/IContract';

export default class ContractRepository extends AbstractRepository<IContract> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, ContractModel);
	}

	findById(id: string) {
		return super.findOne({ id });
	}

}
