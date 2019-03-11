export function removeExtension(value: string): string {
	return value.replace(/\.[a-z]+$/, '');
}

export function dotsCaseToCamelCase(value: string): string {
	return value.replace(/\.([a-z])/g, ([, char]) => char.toUpperCase());
}

export function removeDuplicates<T>(array: T[]): T[] {
	return [...new Set(array)];
}
