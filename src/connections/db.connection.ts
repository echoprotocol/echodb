import AbstractConnection from './abstract.connection';
import ConnectionError from '../errors/connection.error';
import * as config from 'config';
import * as TIME from '../constants/time.constants';
import { connect, disconnect, Mongoose } from 'mongoose';
import { getLogger } from 'log4js';

const logger = getLogger('db.connection');

export default class DbConnection extends AbstractConnection {
	private _connection: Mongoose = null;
	get connection() { return this._connection; }

	// TODO: is it needed to set promise?
	async connect() {
		const { user, password, host, port, database: db, protocol } = config.db;
		const url = `${protocol}://${(user) ? (`${user}:${password}@`) : ''}${host}${port ? `:${port}` : ''}/${db}`;
		await this.connectIterations(url);
	}

	/**
	 * In docker mongoDB can start after the server
	 * so we should be ready for this situation
	 */
	private maxAttemps = 10;
	private async connectIterations(url: string, iteration: number = 0): Promise<void> {
		try {
			 this._connection = await connect(url, { useNewUrlParser: true });
		} catch (error) {
			if (iteration >= this.maxAttemps) throw new ConnectionError(error);
			iteration += 1;
			logger.trace(`Waiting for db, attemp #${iteration}`);
			await new Promise((resolve) => setTimeout(() => resolve(), 2 * TIME.SECOND));
			await this.connectIterations(url, iteration);
		}
	}

	async disconnect() {
		await disconnect();
	}

}
