import AbstractInitableHelper from './abstract.initable.helper';
import * as config from 'config';
import * as Raven from 'raven';
import { getLogger } from 'log4js';

const logger = getLogger('raven.helper');

export default class RavenHelper extends AbstractInitableHelper {
	private installed = false;

	async init() {
		if (!config.raven.enabled) logger.warn('Raven is disabled');
		else await this.install();
	}

	install() {
		Raven.config(config.raven.config).install();
		this.installed = true;
	}

	uninstall() {
		Raven.uninstall();
		this.installed = false;
	}

	warning(message: string, additionalData = {}) {
		logger.warn(message, additionalData);
		this.sendMessageToRaven(message, 'warning', additionalData);
	}

	message(message: string, additionalData = {}) {
		logger.info(message, additionalData);
		this.sendMessageToRaven(message, 'info', additionalData);
	}

	error(error: Error, key: string, additionalData = {}) {
		if (!this.installed) return error;
		const extra = { ...additionalData, key };
		Raven.captureException(error, { extra });
	}

	private sendMessageToRaven(message: string, level: 'info' | 'warning', extra: {}) {
		if (!this.installed) return;
		Raven.captureMessage(message, { level, extra });
	}

}
