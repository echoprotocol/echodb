declare module 'config' {
	export const env: 'development' | 'production';
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
	export const raven: {
		enabled: boolean;
		config: string;
	};
	// Modules
	export const api: {
		port: number;
		sessionSecret: string;
		cors: boolean;
		playground: boolean;
		introspection: boolean;
	};
	export const parser: {
		cacheSize: number;
		speedo: {
			delay: number;
			logCacheSize: boolean;
		};
	};
	// Loggers
	export const memoryLogger: {
		enabled: boolean,
		logOnStart: boolean,
		delay: number,
	};
	export const asyncLogger: {
		delay: number;
		enabled: boolean;
		warnBorder: number;
	};
	export const logger: import('log4js').Configuration;
}
