import { Document } from 'mongoose';
import { IUser } from './IUser';

export interface IUserDocument extends IUser, Document { }
