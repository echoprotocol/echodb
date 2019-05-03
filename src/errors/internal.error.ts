import AbstractError from './abstract.error';

export default class InternalError extends AbstractError {}

export function assert(condition: boolean, message: string): void {
	if (!condition) throw new InternalError(message);
}
