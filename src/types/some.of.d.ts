export type SomeOf<T extends {}> = { [x in keyof T]?: T[x] };
export type SomeOfAny<T extends {}> = { [x in keyof T]?: any };
