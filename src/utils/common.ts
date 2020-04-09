// TODO: sort functions
import BN from 'bignumber.js';
import { HistoryOptionsWithInterval } from '../interfaces/IHistoryOptions';
import ProcessingError from '../errors/processing.error';
import HISTORY_INTERVAL_ERROR from '../errors/history.interval.error';

export function removeExtension(value: string): string {
	return value.replace(/\.[a-z]+$/, '');
}

export function dotsCaseToCamelCase(value: string): string {
	return value.replace(/\.([a-z])/g, ([, char]) => char.toUpperCase());
}

export function removeDuplicates<T>(array: T[]): T[] {
	return [...new Set(array)];
}

export function removeFromArray(array: any[], value: any) {
	const findFn = typeof value === 'function' ? value : (item: any) => item === value;
	const index = array.findIndex(findFn);
	if (index === -1) return;
	array.splice(index, 1);
}

export function addToArray(array: any[], item: any) {
	if (!array.includes(item)) array.push(item);
}

export function calculateAverage(array: (number|string|BN)[]): BN {
	const summ: any = array.reduce((acc: BN, val: number|string|BN) => acc.plus(val), new BN(0));
	return summ.div(array.length);
}

export function parseHistoryOptions(historyOpts: HistoryOptionsWithInterval) {
	if (!historyOpts.from || !historyOpts.interval) {
		throw new ProcessingError(HISTORY_INTERVAL_ERROR.INVALID_HISTORY_PARAMS);
	}
	const startDate = Date.parse(historyOpts.from) / 1000;
	const endDate = Date.parse(historyOpts.to || new Date().toString()) / 1000;
	const interval = historyOpts.interval;
	if (endDate <= startDate) {
		throw new ProcessingError(HISTORY_INTERVAL_ERROR.INVALID_DATES);
	}
	if (endDate - startDate < interval) {
		throw new ProcessingError(HISTORY_INTERVAL_ERROR.INVALID_INTERVAL);
	}

	return { startDate, endDate, interval };
}
