import * as config from 'config';
import { Echo } from 'echojs-lib';
import AbstractConnection from './abstract.connection';
import ConnectionError from '../errors/connection.error';

export const ERROR = {
	NOT_CONNECTED: 'echo was not connected',
};

export default class EchoConnection extends AbstractConnection {
	private _connection: Echo;

	get echo() {
		if (!this._connection || !this._connection.isConnected) {
			throw new ConnectionError(ERROR.NOT_CONNECTED);
		}
		return this._connection;
	}

	async connect() {
		this._connection = new Echo();
		await this._connection.connect(config.echo.url);
	}

	async disconnect() {
		await this._connection.disconnect();
	}

}
