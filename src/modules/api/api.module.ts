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
import RestError from '../../errors/rest.error';
import FormError from '../../errors/form.error';
import * as config from 'config';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { promisify } from 'util';
import { getLogger } from 'log4js';
import { buildSchema } from 'type-graphql';
import { initMiddleware } from './express.middleware';
import { formatError, GraphQLError } from 'graphql';

const logger = getLogger('api.module');

export default class ApiModule extends AbstractModule {
	private app: express.Express;

	constructor(
		readonly ravenHelper: RavenHelper,
		readonly accountResolver: AccountResolver,
		readonly contractResolver: ContractResolver,
		readonly balanceResolver: BalanceResolver,
		readonly blockResolver: BlockResolver,
		readonly operationResolver: OperationResolver,
		readonly transactionResolver: TransactionResolver,
		readonly tokenResolver: TokenResolver,
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
			this.contractResolver,
			this.balanceResolver,
			this.blockResolver,
			this.operationResolver,
			this.transactionResolver,
		];
		// TODO: handle errors with middleware
		const schema = await buildSchema({
			resolvers,
			validate: false,
		});
		const gqlMiddleware = graphqlHTTP({
			schema,
			graphiql: config.env === 'development',
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
				// TODO: add raven
				return { code: 500, message: 'server side error' };
			},
		 });
		this.app.use('/', gqlMiddleware);
	}

}
