import InfoModel from '../models/info.model';
import * as INFO from '../constants/info.constants';
import { IInfo } from '../interfaces/IInfo';
import { TDoc } from '../types/mongoose';

export default class InfoRepository {
	private cache: { [x in INFO.KEY]?: TDoc<IInfo>} = {};

	async get<T extends INFO.KEY>(key: T): Promise<INFO.KEY_TYPE[T]> {
		if (!this.cache[key]) {
			this.cache[key] = await InfoModel.findOne({ key })
				|| await InfoModel.create({ key, value: INFO.DEFAULT_VALUE[key] });
		}
		return <INFO.KEY_TYPE[T]>this.cache[key].value;
	}

	async set<T extends INFO.KEY>(key: T, value: INFO.KEY_TYPE[T]): Promise<void> {
		if (this.cache[key]) {
			this.cache[key].value = value;
			await this.cache[key].save();
		} else await InfoModel.updateOne({ key }, { key, value });
	}

}
