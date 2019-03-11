import { Document } from 'mongoose';
import * as ECHO from '../constants/echo.constants';

export type IOperation<T extends ECHO.OPERATION_ID> = {
	id: T;
	body: ECHO.OPERATION_PROPS[T];
	result: ECHO.OPERATION_RESULT[T];
};

// @ts-ignore
export interface IOperationDocument<T extends ECHO.OPERATION_ID> extends IOperation<T>, Document {}
