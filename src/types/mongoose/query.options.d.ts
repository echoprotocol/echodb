// https://mongoosejs.com/docs/api.html#query_Query-setOptions

declare type Lean = {
	lean?: boolean,
};

declare type MaxTimeMs = {
	maxTimeMs?: number,
};

declare type CommonUpdate = {
	upsert?: boolean,
	writeConcern?: object,
	timestamps?: boolean,
};

declare type Find = {
	tailable?: unknown,
	sort?: object,
	limit?: number,
	skip?: number,
	batchSize?: unknown,
	comment?: string,
	snapshot?: unknown,
	readPreference?: unknown,
	lean?: boolean,
};

declare type Common = {
	session?: unknown,
	collation?: {
		locale?: string,
		caseLevel?: boolean,
		caseFirst?: string,
		strength?: number,
		numericOrdering?: boolean,
		alternate?: string,
		maxVariable?: string,
		backwards?: boolean,
	},
};

export type QueryOptions = {
	readonly Update: Update,
	readonly Find: Find,
	readonly FindOne: FindOne,
	readonly FindOneAndUpdate: FindOneAndUpdate,
	readonly FindById: FindById,
	readonly FindByIdAndUpdate: FindByIdAndUpdate,
};

// export type QueryOptions = {
// 	readonly Update,
// 	readonly Find,
// 	readonly FindOne,
// 	readonly FindOneAndUpdate,
// 	readonly FindById,
// 	readonly FindByIdAndUpdate,
// };

// FIXME: refactor export
export declare type Update = CommonUpdate & Lean & Common & MaxTimeMs;
export declare type Find = Find & Lean & Common;
export declare type FindOne = Lean & Common;
export declare type FindOneAndUpdate = CommonUpdate & Lean & Common;
export declare type FindById = Lean & Common;
export declare type FindByIdAndUpdate = CommonUpdate & Lean & Common;

// export declare const QueryOptions = {
// };
