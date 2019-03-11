import AbstractRepository from './abstract.repository';
import RavenHelper from '../helpers/raven.helper';
import { IOperationDocument } from '../interfaces/IOperation';
import OperationModel from '../models/operation.model';
import * as ECHO from '../constants/echo.constants';

export default class TransactionRepository extends AbstractRepository<IOperationDocument<ECHO.OPERATION_ID>> {
	constructor(
		ravenHelper: RavenHelper,
	) {
		super(ravenHelper, OperationModel);
	}
}
