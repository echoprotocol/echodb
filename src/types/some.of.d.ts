export type SomeOfAny<T extends {}> = { [x in keyof T]?: any };
