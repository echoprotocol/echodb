import * as config from 'config';
import { connect, disconnect } from 'mongoose';
import AbstractConnection from './abstract.connection';

export default class DbConnection extends AbstractConnection {
	// TODO: is it needed to set promise?
	async connect() {
		const { user, password, host, port, database } = config.db;
		const url = `mongodb://${(user) ? (`${user}:${password}@`) : ''}${host}:${port}/${database}`;
		await connect(url, { useNewUrlParser: true });
	}

	async disconnect() {
		await disconnect();
	}

}
