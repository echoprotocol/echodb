
export default class CacheMap<K, V> extends Map<K, V> {

	constructor(
		readonly maxSize: number,
	) {
		super();
	}

	set(key: K, value: V): this {
		if (this.size >= this.maxSize) {
			const firstKey = this.keys().next().value;
			super.delete(firstKey);
		}
		return super.set(key, value);
	}

}
