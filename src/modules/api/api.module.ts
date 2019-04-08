import 'reflect-metadata';
import AccountResolver from './resolvers/account.resolver';
import AbstractModule from '../abstract.module';
import ContractResolver from './resolvers/contract.resolver';
import BalanceResolver from './resolvers/balance.resolver';
import BlockResolver from './resolvers/block.resolver';
import OperationResolver from './resolvers/operation.resolver';
import TransactionResolver from './resolvers/transaction.resolver';
import TokenResolver from './resolvers/token.resolver';
import RavenHelper from '../../helpers/raven.helper';
import RedisConnection from '../../connections/redis.connection';
import RestError from '../../errors/rest.error';
import PubSubEngine from './pub.sub.engine';
import FormError from '../../errors/form.error';
import * as http from 'http';
import * as config from 'config';
import * as express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { promisify } from 'util';
import { getLogger } from 'log4js';
import { buildSchema } from 'type-graphql';
import { initMiddleware } from './express.middleware';
import { formatError, GraphQLError } from 'graphql';

const logger = getLogger('api.module');

// FIXME: return to express with apollo-server
export default class ApiModule extends AbstractModule {
	private expressApp: express.Express;
	private gqlServer: ApolloServer;
	private httpServer: http.Server;

	constructor(
		readonly accountResolver: AccountResolver,
		readonly balanceResolver: BalanceResolver,
		readonly blockResolver: BlockResolver,
		readonly contractResolver: ContractResolver,
		readonly operationResolver: OperationResolver,
		readonly ravenHelper: RavenHelper,
		readonly redisConnection: RedisConnection,
		readonly pubSubEngine: PubSubEngine,
		readonly transactionResolver: TransactionResolver,
		readonly tokenResolver: TokenResolver,
	) {
		super();
	}

	async init() {
		this.expressApp = express();

		initMiddleware(this.expressApp);
		await this.initGQL();

		this.httpServer = http.createServer(this.expressApp);
		this.initGQLSubscriptions();
		await promisify(this.httpServer.listen.bind(this.httpServer))(config.port);
		logger.info('API application listens to', config.port, 'port');
		logger.info('GraphQl path', this.gqlServer.graphqlPath);
		logger.info('GraphQl subscriptions path', this.gqlServer.subscriptionsPath);
	}

	async initGQL() {
		const resolvers: any[] = [
			this.accountResolver,
			this.contractResolver,
			this.balanceResolver,
			this.blockResolver,
			this.operationResolver,
			this.transactionResolver,
		];
		const schema = await buildSchema({
			resolvers,
			validate: false,
			pubSub: this.pubSubEngine.engine,
		});
		this.gqlServer = new ApolloServer({
			schema,
			// FIXME: resolve ts-ignore
			// @ts-ignore
			formatError: (error: GraphQLError) => {
				const original = error.originalError;
				if (!original || original instanceof GraphQLError) return formatError(error);
				if (original instanceof RestError) {
					return {
						code: original.code,
						message: original instanceof FormError ? original.details : original.message,
					};
				}
				logger.error(error);
				this.ravenHelper.error(error, 'apiModule#gqlError');
				return { code: 500, message: 'server side error' };
			},
		});
		this.gqlServer.applyMiddleware({ app: this.expressApp });
	}

	initGQLSubscriptions() {
		this.gqlServer.installSubscriptionHandlers(this.httpServer);
	}

}
