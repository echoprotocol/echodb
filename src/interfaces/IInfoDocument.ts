import { Document } from 'mongoose';
import { IInfo } from './IInfo';

export interface IInfoDocument extends IInfo, Document { }
