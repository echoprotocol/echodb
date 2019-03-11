import * as config from 'config';
import { getLogger } from 'log4js';
import AbstractInitableHelper from './abstract.initable.helper';

const logger = getLogger('memory.helper');

// TODO: configure to log into a file
export default class MemoryHelper extends AbstractInitableHelper{
	private interval: NodeJS.Timeout | null = null;

	init() {
		if (!config.memory.enabled) logger.warn('Memory helper is disabled');
		else this.start();
	}

	start(logOnStart = config.memory.logOnStart) {
		if (logOnStart) this.logMemoryUsage();
		this.interval = setInterval(() => this.logMemoryUsage(), config.memory.delay);
	}

	stop() {
		clearInterval(this.interval);
	}

	logMemoryUsage(prefix: string = null) {
		const mbs = this.memoryUsage;
		const text = `${prefix !== null ? `${prefix} - ` : ''}Memory usage ${mbs.toFixed(3)} mbs`;
		if (mbs > 1000) logger.warn(text);
		else logger.info(text);
	}

	get memoryUsage() {
		return process.memoryUsage().heapUsed / 1e6;
	}

}
