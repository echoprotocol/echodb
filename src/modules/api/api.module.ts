import { promisify } from 'util';
import { getLogger } from 'log4js';
import * as config from 'config';
import AbstractModule from '../abstract.module';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import { initMiddleware } from './middleware';
import RestError from '../../errors/rest.error';
import FormError from '../../errors/form.error';
import * as HTTP from '../../constants/http.constants';
import RavenHelper from 'helpers/raven.helper';
import { Response, Request } from 'express-serve-static-core';
import { Action, Handler } from '../../types/api';

import AbstractController from './controllers/abstract.controller';

import GraphqlSchema from './graphql/graphql.schema';

const logger = getLogger('api.module');

export default class ApiModule extends AbstractModule {
	private app: express.Express;

	constructor(
		readonly ravenHelper: RavenHelper,
		readonly graphqlSchema: GraphqlSchema,
	) {
		super();
	}

	async init() {
		this.app = express();

		initMiddleware(this.app);
		await promisify(this.app.listen.bind(this.app))(config.port);
		logger.info('API application listens to', config.port, 'port');

		this.initRoutes();
	}

	initRoutes() {
		const controllers: AbstractController[] = [];
		for (const controller of controllers) {
			controller.initRoutes(this.addRoute.bind(this));
		}
		// FIXME: move to constants ?
		if (config.env === 'development') this.app.use('/apidoc', express.static('apidoc'));

		this.initGraphql();

		this.addRoute(HTTP.METHOD.GET, '*', [
			() => { throw new RestError(HTTP.CODE.METHOD_NOT_ALLOWED); },
		]);
	}

	addRoute(
		method: HTTP.METHOD,
		route: string,
		// handlers: [Action, ...Handler[]],
		[action, ...handlers]: [Action, ...Handler[]],
		responseType = HTTP.RESPONSE_TYPE.JSON,
	) {
		// TODO: check handlers length
		this.app[method](route, async (req, res) => {
			try {
				req.form = { ...req.query, ...req.params, ...req.body };
				this.traceRequest(req, req.form);
				for (const handler of handlers) handler(req);
				const result = await action({ req, form: req.form, user: req.user });
				switch (responseType) {
					case HTTP.RESPONSE_TYPE.JSON:
						res.status(HTTP.CODE.OK).json({
							result: result || null,
							status: HTTP.CODE.OK,
						});
						break;
					case HTTP.RESPONSE_TYPE.FILE:
						res.send(result);
						break;
				}
			} catch (error) {
				if (!(error instanceof RestError)) {
					logger.error(error);
					this.ravenHelper.error(error, 'api#handleRequest', { method, route, form: req.form });
					this.sendError(res, new RestError(HTTP.CODE.INTERNAL_SERVER_ERROR));
				} else this.sendError(res, error);
			}
		});
	}

	initGraphql() {
		const schema = this.graphqlSchema.init();
		this.app.use('/graphql', graphqlHTTP({ schema, graphiql: false }));
		// FIXME: move to constants ?
		if (config.env === 'development') {
			this.app.use('/graphiql', graphqlHTTP({ schema, graphiql: true }));
		}
	}

	private sendError(res: Response, error: RestError | FormError) {
		res.status(error.code).json({
			error: error instanceof FormError ? error.details : error.message,
			status: error.code,
		});
	}

	private traceRequest(req: Request, form: Express.Request['form']) {
		if (!config.traceApiRequests) return;
		form = { ...form };
		['password'].forEach((key) => {
			if (!form[key]) return;
			// tslint:disable-next-line:prefer-array-literal
			form[key] = new Array(form[key].length).fill('*').join('');
		});
		logger.trace(`${req.method.toUpperCase()} Request ${req.originalUrl}`, JSON.stringify(form));
	}

}
