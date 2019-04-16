import { Document } from 'mongoose';

export type TDocument<T = {}> = T & Document;
