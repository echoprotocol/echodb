import { Document } from 'mongoose';
import { IBlock } from './IBlock';

export interface IBlockDocument extends IBlock, Document {}
