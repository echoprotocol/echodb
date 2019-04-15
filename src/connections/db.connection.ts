import * as config from 'config';
import { connect, disconnect, Connection } from 'mongoose';
import AbstractConnection from './abstract.connection';
import { getLogger } from 'log4js';

const logger = getLogger('db.connection');

export default class DbConnection extends AbstractConnection {
	private _connection: Connection = null;
	get connection() { return this._connection; }

	// TODO: is it needed to set promise?
	async connect() {
		const { user, password, host, port, database: db, protocol } = config.db;
		const url = `${protocol}://${(user) ? (`${user}:${password}@`) : ''}${host}${port ? `:${port}` : ''}/${db}`;
		// FIXME: fix types !!! (coz of graph ql);
		// @ts-ignore
		await this.connectIterations(url);
	}

	/**
	 * In docker mongoDB can start after the server
	 * so we should be ready for this situation
	 * @param {string} url
	 * @param {number} iteration
	 * @returns {Promise<any>}
	 * @private
	 */
	private async connectIterations(url: string, iteration: number = 0) {
		try {
			 this._connection = await connect(url, { useNewUrlParser: true });
		} catch (error) {
			if (iteration >= 10) {
				throw new Error(error);
			}
			iteration += 1;
			logger.trace(`wait reconnect. Iteration #${iteration}`);
			await new Promise((success) => setTimeout(() => success(), 2000));
			await this.connectIterations(url, iteration);
		}
	}

	async disconnect() {
		await disconnect();
	}

	initModels() {

	}

}
