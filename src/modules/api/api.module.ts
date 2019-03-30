import AccountResolver from './resolvers/account.resolver';
import AbstractModule from '../abstract.module';
import ContractResolver from './resolvers/contract.resolver';
import RavenHelper from 'helpers/raven.helper';
import * as config from 'config';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { promisify } from 'util';
import { getLogger } from 'log4js';
import { buildSchema } from 'type-graphql';
import { initMiddleware } from './middleware';

const logger = getLogger('api.module');

export default class ApiModule extends AbstractModule {
	private app: express.Express;

	constructor(
		readonly ravenHelper: RavenHelper,
		readonly accountResolver: AccountResolver,
		readonly contractResolver: ContractResolver,
	) {
		super();
	}

	async init() {
		this.app = express();

		initMiddleware(this.app);
		await this.initGQL();

		await promisify(this.app.listen.bind(this.app))(config.port);
		logger.info('API application listens to', config.port, 'port');
	}

	async initGQL() {
		const resolvers: any[] = [
			this.accountResolver,
		];
		const schema = await buildSchema({
			resolvers,
		});
		const gqlMiddleware = graphqlHTTP({ schema, graphiql: config.env === 'development' });
		this.app.use('/', gqlMiddleware);
	}

}
