import RavenHelper from '../helpers/raven.helper';
import { Document, Model, PopulateOptions, ModelUpdateOptions, UpdateWriteOpResult } from 'mongoose';
import { QueryOptions, MongoId, TDoc } from '../types/mongoose';

// TODO: use mongoose Query<T>
// TODO: do no send private info to raven ???

// TODO: add more words like $set
type Update<T extends {}> = { $set: Partial<T> } | Partial<T>;

export default abstract class AbstractRepository<T = object> {
	constructor(private ravenHelper: RavenHelper, private model: Model<TDoc<T>>) {
		model.init(() => {
			// @ts-ignore
			model.createCollection();
		});
	}

	// FIXME: refactor copy-paste
	async findById(id: MongoId | string, projection = {}, options: QueryOptions['FindById'] = {}) {
		try {
			return await this.model.findById(id, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findById', { id, projection, options });
		}
	}

	async findByMongoId(id: MongoId | string, projection = {}, options: QueryOptions['FindById'] = {}) {
		try {
			return await this.model.findById(id, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findByMongoId', { id, projection, options });
		}
	}

	async findOne(query: object, projection = {}, options: QueryOptions['FindOne'] = {}) {
		try {
			return await this.model.findOne(query, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findOne', { query, projection, options });
		}
	}

	async find(query: object, projection = {}, options: ModelUpdateOptions = {}) {
		try {
			return await this.model.find(query, projection, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#find', { query, projection, options });
		}
	}
	async create(document: T): Promise<TDoc<T>>;
	async create(document: T[]): Promise<TDoc<T>[]>;
	async create(document: T | T[]): Promise<T & Document| TDoc<T>[]> {
		try {
			return await this.model.create(document);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#create', { document });
		}
	}

	// TODO: check return type
	async update(query: object, update: Update<T>, options: QueryOptions['Update'] = {}): Promise<UpdateWriteOpResult> {
		try {
			return await this.model.update(query, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#update', { query, update, options });
		}
	}

	// TODO: check return type
	async updateOne(query: object, update: Update<T>, options: QueryOptions['UpdateOne'] = {}): Promise<UpdateWriteOpResult> {
		try {
			return await this.model.updateOne(query, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#update', { query, update, options });
		}
	}

	async findByIdAndUpdate(id: MongoId, update: Update<T>, options: QueryOptions['FindByIdAndUpdate'] = {}) {
		try {
			return await this.model.findByIdAndUpdate(id, update, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#findByIdAndUpdate', { id, update, options });
		}
	}

	async findOneAndUpdate(query: object, update: Update<T>, options: QueryOptions['FindOneAndUpdate'] = {}) {
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
			return await this.model.countDocuments(query);
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

	// FIXME: refactor, add types
	async populate(documents: Document[], fieldOrOptions: string | PopulateOptions) {
		try {
			const options = typeof fieldOrOptions === 'string' ? { path: fieldOrOptions } : fieldOrOptions;
			return await this.model.populate(documents, options);
		} catch (error) {
			throw this.ravenHelper.error(error, 'model#populate', { fieldOrOptions, documents });
		}
	}

	isChild(object: any) {
		return object instanceof this.model;
	}

}
