import * as config from 'config';
import * as log4js from 'log4js';
import { initConnections, initInitableHelpers, initModule } from './_awilix';

log4js.configure(config.logger);
const logger = log4js.getLogger();

async function main() {
	try {
		await initInitableHelpers();
		await initConnections();
		const moduleName = process.env.MODULE;
		logger.trace(`${moduleName} module initializing`);
		await initModule(process.env.MODULE);
		logger.info(`${moduleName} module started`);
	} catch (error) {
		logger.fatal(error);
		process.exit(1);
	}
}

main();

// global todos:
// TODO: use const enums
