import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import { IOperation } from '../interfaces/IOperation';
import OperationModel from '../models/operation.model';
import * as ECHO from '../constants/echo.constants';

export default class OperationRepository extends AbstractRepository<IOperation<ECHO.OPERATION_ID>> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, OperationModel);
	}
}
