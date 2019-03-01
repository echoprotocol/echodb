import InfoModel from '../models/info.model';
import * as INFO from '../constants/info.constants';

export default class InfoRepository {

	async get<T extends INFO.KEY>(key: T): Promise<INFO.KEY_TYPE[T]> {
		const document = await InfoModel.findOne({ key })
			|| await InfoModel.create({ key, value: INFO.DEFAULT_VALUE[key] });
		return <INFO.KEY_TYPE[T]>document.value;
	}

	async set<T extends INFO.KEY>(key: T, value: INFO.KEY_TYPE[T]): Promise<void> {
		await InfoModel.update({ key }, { key, value });
	}

	// TODO: refactor ?

}
