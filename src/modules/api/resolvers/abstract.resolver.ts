import RestError from '../../../errors/rest.error';
import ProcessingError from '../../../errors/processing.error';
import { MethodErrorMap } from '../../../types/error.map';

export default abstract class AbstractResolver {

	parseError(errorMap: MethodErrorMap, error: Error) {
		if (!(error instanceof ProcessingError)) throw error;
		const details = errorMap[error.message];
		if (!details) throw new Error('error is not listed in the error map');
		if (details instanceof Array) {
			const [code, message = error.message] = details;
			return new RestError(code, message);
		}
		return new RestError(details);
	}

}

export function handleError(errorMap: MethodErrorMap) {
	return function (target: AbstractResolver, _: string, descriptor: PropertyDescriptor) {
		const original = descriptor.value.bind(target);
		descriptor.value = async function (...args: any[]) {
			try {
				return await original(...args);
			} catch (error) {
				throw this.parseError(errorMap, error);
			}
		};
		return descriptor;
	};
}
