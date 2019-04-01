import * as HTTP from '../constants/http.constants';

export declare type Code = HTTP.CODE;
export declare type CodeAndDefaultMessage = [HTTP.CODE];
export declare type CodeAndMessage = [HTTP.CODE, string];

export declare interface MethodErrorMap {
	[key: string]: Code | CodeAndMessage | CodeAndDefaultMessage;
}

export declare interface ErrorMap {
	[key: string]: MethodErrorMap;
}
