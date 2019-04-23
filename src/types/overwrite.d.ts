import { Diff } from './diff';

export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;
