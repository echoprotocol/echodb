import * as config from 'config';
import { connect, disconnect, Connection } from 'mongoose';
import AbstractConnection from './abstract.connection';

export default class DbConnection extends AbstractConnection {
	private _connection: Connection = null;
	get connection() { return this._connection; }

	// TODO: is it needed to set promise?
	async connect() {
		const { user, password, host, port, database: db, protocol } = config.db;
		const url = `${protocol}://${(user) ? (`${user}:${password}@`) : ''}${host}${port ? `:${port}` : ''}/${db}`;
		// FIXME: fix types !!! (coz of graph ql);
		// @ts-ignore
		this._connection = await connect(url, { useNewUrlParser: true });
	}

	async disconnect() {
		await disconnect();
	}

	initModels() {

	}

}
