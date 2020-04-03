// TODO: sort functions
import BN from 'bignumber.js';

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
