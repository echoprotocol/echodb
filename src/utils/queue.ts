interface Element<T> {
	next: Element<T> | null;
	value: T;
}

// TODO: rewrite into webassembly
export default class Queue<T> {
	private _size = 0;
	private first: Element<T> | null = null;
	private last: Element<T> | null = null;
	get size() { return this._size; }

	push(value: T) {
		const element: Element<T> = { value, next: null };
		if (!this.first) {
			this.first = this.last = element;
		} else {
			this.last.next = element;
			this.last = element;
		}
		this._size += 1;
	}

	pop() {
		if (!this.first) throw new Error('Queue is empty');
		const value = this.first.value;
		if (this.first === this.last) this.first = this.last = null;
		else this.first = this.first.next;
		this._size -= 1;
		return value;
	}

}
