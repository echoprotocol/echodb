import InitableHelper from './abstract.initable.helper';
import * as config from 'config';
import { getLogger } from 'log4js';
import { createHook, AsyncHook } from 'async_hooks';

const logger = getLogger('async.tracker');

export default class AsyncTrackerHelper extends InitableHelper {
	private counter = 0;
	private hook: AsyncHook;
	private interval: NodeJS.Timeout;

	init() {
		if (!config.asyncLogger.enabled) {
			logger.warn('Async tracker is disabled');
		} else {
			this.hook = createHook({ init: this.hookInit.bind(this), destroy: this.hookDestroy.bind(this) });
			this.hook.enable();
			this.interval = setInterval(() => this.log(), config.asyncLogger.delay);
		}
		process.on('exit', () => {
			this.log();
		});
	}

	stop() {
		clearInterval(this.interval);
	}

	hookInit() {
		this.counter += 1;
	}

	hookDestroy() {
		this.counter -= 1;
	}

	log() {
		const level: 'warn' | 'trace' = this.counter > (config.asyncLogger.warnBorder || 20000) ? 'warn' : 'trace';
		logger[level]('Async callstack size:', this.counter);
	}

}
