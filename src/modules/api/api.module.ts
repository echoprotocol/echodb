import 'reflect-metadata';
import AccountResolver from './resolvers/account.resolver';
import AbstractModule from '../abstract.module';
import AssetResolver from './resolvers/asset.resolver';
import ContractBalanceResolver from './resolvers/contract.balance.resolver';
import ContractResolver from './resolvers/contract.resolver';
import BalanceResolver from './resolvers/balance.resolver';
import BlockResolver from './resolvers/block.resolver';
import OperationResolver from './resolvers/operation.resolver';
import RavenHelper from '../../helpers/raven.helper';
import RestError from '../../errors/rest.error';
import FormError from '../../errors/form.error';
import PubSubEngine from './pub.sub.engine';
import TransactionResolver from './resolvers/transaction.resolver';
import TokenResolver from './resolvers/token.resolver';
import TransferResolver from './resolvers/transfer.resolver';
import * as HTTP from '../../constants/http.constants';
import * as http from 'http';
import * as config from 'config';
import * as express from 'express';
import { promisify } from 'util';
import {
	ApolloServer,
	SchemaError,
	SyntaxError,
	UserInputError,
	ValidationError,
} from 'apollo-server-express';
import { getLogger } from 'log4js';
import { buildSchema } from 'type-graphql';
import { initMiddleware } from './express.middleware';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import ERC20TokenResolver from './resolvers/erc20Token.resolver';

const logger = getLogger('api.module');

// class BasicLogging {
// 	requestDidStart({ request, operationName }: any) {
// 		console.log(`request on ${request.url || request} whit ${operationName}`);
// 	}
// }
// FIXME: return to express with apollo-server
export default class ApiModule extends AbstractModule {
	private expressApp: express.Express;
	private gqlServer: ApolloServer;
	private httpServer: http.Server;

	constructor(
		private ravenHelper: RavenHelper,
		private pubSubEngine: PubSubEngine,
		private accountResolver: AccountResolver,
		private balanceResolver: BalanceResolver,
		private blockResolver: BlockResolver,
		private contractResolver: ContractResolver,
		private operationResolver: OperationResolver,
		private tokenResolver: TokenResolver,
		private transactionResolver: TransactionResolver,
		private assetResolver: AssetResolver,
		private contractBalanceResolver: ContractBalanceResolver,
		private transferResolver: TransferResolver,
		private erc20TokenResolver: ERC20TokenResolver,
	) {
		super();
	}

	async init() {
		this.expressApp = express();

		initMiddleware(this.expressApp);
		await this.initGQL();

		this.httpServer = http.createServer(this.expressApp);
		this.initGQLSubscriptions();
		await promisify(this.httpServer.listen.bind(this.httpServer))(config.api.port);
		logger.info('API application listens to', config.api.port, 'port');
		logger.info('GraphQl path', this.gqlServer.graphqlPath);
		logger.info('GraphQl subscriptions path', this.gqlServer.subscriptionsPath);
	}

	async initGQL() {
		const resolvers: any[] = [
			this.accountResolver,
			this.contractBalanceResolver,
			this.contractResolver,
			this.balanceResolver,
			this.blockResolver,
			this.operationResolver,
			this.transactionResolver,
			this.tokenResolver,
			this.assetResolver,
			this.transferResolver,
			this.erc20TokenResolver,
		];
		const schema = await buildSchema({
			resolvers,
			validate: false,
			pubSub: this.pubSubEngine.engine,
		});
		this.gqlServer = new ApolloServer({
			schema,
			formatError: this.formatError.bind(this),
			introspection: config.api.introspection,
			playground: config.api.playground,
			// extensions: [() => new BasicLogging()]
		});
		this.gqlServer.applyMiddleware({ app: this.expressApp });
	}

	initGQLSubscriptions() {
		this.gqlServer.installSubscriptionHandlers(this.httpServer);
	}

	formatError(error: GraphQLError) {
		const original = error.originalError;
		if (original instanceof RestError) return this.formatRestError(error, original);
		if ((original && original instanceof GraphQLError)
			|| (!original && error instanceof GraphQLError)
			|| error instanceof SchemaError
			|| error instanceof SyntaxError
			|| error instanceof UserInputError
			|| error instanceof ValidationError
		) return error;
		return this.handleServerSideError(error, original);
	}

	formatRestError(parent: GraphQLError, error: RestError) {
		if (config.env !== 'development') delete parent.extensions.exception;
		else parent.extensions.exception = { stacktrace: parent.extensions.exception.stacktrace };
		parent.extensions.code = error.code.toString();
		if (error instanceof FormError) {
			parent.extensions.details = error.details;
		}
		return parent;
	}

	handleServerSideError(error: GraphQLError, original: Error) {
		const errToLog = original || error;
		logger.error(errToLog);
		this.ravenHelper.error(errToLog, 'apiModule#serverSideError');
		return <GraphQLFormattedError>{
			message: HTTP.DEFAULT_MESSAGE[HTTP.CODE.INTERNAL_SERVER_ERROR],
			extensions: { code: HTTP.CODE.INTERNAL_SERVER_ERROR.toString() },
			locations: undefined,
			path: undefined,
		};
	}
}
