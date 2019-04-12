declare module 'config' {
	export const env: 'development' | 'production';
	export const cors: boolean;
	export const graphiql: boolean;
	export const port: number;
	export const sessionSecret: string;
	export const memory: {
		enabled: boolean,
		logOnStart: boolean,
		delay: number,
	};
	export const db: {
		user: string;
		password: string;
		host: string;
		port: string;
		database: string;
		protocol: string;
	};
	export const redis: {
		channel: string,
		host: string;
	};
	export const redis: {
		channel: string,
		host: string;
	};
	export const echo: {
		url: string;
		accountId: string;
		privateKeyWif: string;
	};
	export const redis: {
		channel: string,
		host: string;
	};
	export const echo: {
		url: string;
	};
	export const logger: import('log4js').Configuration;
	export const raven: {
		enabled: boolean;
		config: string;
	};
}
