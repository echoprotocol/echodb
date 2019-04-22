import { Types, Document } from 'mongoose';
import { TDocument } from './tdocument';

export type MongoId = Types.ObjectId | TDocument;
