import * as HTTP from '../constants/http.constants';

export type Code = HTTP.CODE;
export type CodeAndDefaultMessage = [HTTP.CODE];
export type CodeAndMessage = [HTTP.CODE, string];

export interface MethodErrorMap {
	[key: string]: Code | CodeAndMessage | CodeAndDefaultMessage;
}

export interface ErrorMap {
	[key: string]: MethodErrorMap;
}
