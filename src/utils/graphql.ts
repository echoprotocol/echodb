// TODO: check
export function inject(target: { new(...args: any[]): any; }, propertyKey: string) {
	const symbol = Symbol(propertyKey);
	Object.defineProperty(target.prototype, propertyKey, {
		get: () => {
			return target.prototype[symbol];
		},
		set: (value) => {
			if (!target.prototype[symbol]) target.prototype[symbol] = value;
		},
	});
}
