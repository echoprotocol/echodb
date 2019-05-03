import { Types, Document } from 'mongoose';
import { TDocument } from './tdocument';

export type MongoId<T = object> = Types.ObjectId | TDocument<T>;
