import { Document, Model } from 'mongoose';
import RavenHelper from '../helpers/raven.helper';
import { QueryOptions, MongoId } from '../types/mongoose';

// TODO: do no send private info to raven ???
export default abstract class AbstractRepository<T extends Document> {
	constructor(private ravenHelper: RavenHelper, private model: Model<T>) {
		model.init(() => {
			// @ts-ignore
			model.createCollection();
		});
	}

	async findById(id: MongoId, projection = {}, options: QueryOptions['FindById'] = {}) {
		try {
			return await this.model.findById(id, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findById', { id, projection, options });
		}
	}

	async findOne(query: object, projection = {}, options: QueryOptions['FindOne'] = {}) {
		try {
			return await this.model.findOne(query, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findOne', { query, projection, options });
		}
	}

	async find(query: object, projection = {}, options: QueryOptions['Find'] = {}) {
		try {
			return await this.model.find(query, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#find', { query, projection, options });
		}
	}

	async create(document: object | object[]) {
		try {
			return await this.model.create(document);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#create', { document });
		}
	}

	// TODO: check return type
	async update(query: object, update: object, options: QueryOptions['Update'] = {}): Promise<Number> {
		try {
			return await this.model.update(query, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#update', { query, update, options });
		}
	}

	// TODO: check return type
	async updateOne(query: object, update: object, options: QueryOptions['UpdateOne'] = {}): Promise<Number> {
		try {
			return await this.model.updateOne(query, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#update', { query, update, options });
		}
	}

	async findByIdAndUpdate(id: MongoId, update: object, options: QueryOptions['FindByIdAndUpdate'] = {}) {
		try {
			return await this.model.findByIdAndUpdate(id, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findByIdAndUpdate', { id, update, options });
		}
	}

	async findOneAndUpdate(query: object, update: object, options: QueryOptions['FindOneAndUpdate'] = {}) {
		try {
			return await this.model.findOneAndUpdate(query, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findOneAndUpdate', { query, update, options });
		}
	}

	async remove(query: object) {
		try {
			return await this.model.remove(query);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#remove', query);
		}
	}

	async count(query: object) {
		try {
			return await this.model.count(query);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#count', query);
		}
	}

	async aggregate(aggregation: object[]) {
		try {
			return await this.model.aggregate(aggregation);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#aggregate', aggregation);
		}
	}

}
