import EchoRepository from '../../repositories/echo.repository';
import InfoRepository from '../../repositories/info.repository';
import * as INFO from '../../constants/info.constants';
import * as config from 'config';
import { Block } from 'echojs-lib';
import { EventEmitter } from 'events';
import { getLogger } from 'log4js';

const logger = getLogger('block.engine');

const enum EVENT {
	NEW_BLOCK = 'new_block',
}

const enum STAGE {
	HISTORY = 'history',
	LIVE = 'live',
}

const BATCH_SIZE = 10;

export default class BlockEngine extends EventEmitter {
	private last: number;
	private current: number;
	private cache = new Map<number, Promise<Block>>();
	private maxCacheSize = config.parser.cacheSize;
	private speedoTimeout: NodeJS.Timeout;
	private ee = new EventEmitter();

	public stage: STAGE;

	constructor(
		private echoRepository: EchoRepository,
		private infoRepository: InfoRepository,
	) {
		super();
	}

	private waitForNewBlock() {
		return new Promise<number>((resolve) =>
			this.ee.once(EVENT.NEW_BLOCK, () => resolve()));
	}

	// TODO: enable caching when second iterator on live stage
	private subscribeToNewBlock() {
		this.echoRepository.subscribeToNewBlock((num: number) => {
			this.last = num;
			this.ee.emit(EVENT.NEW_BLOCK);
		});
	}

	public async finished() {
		this.cache.delete(this.current);
		this.current += 1;
		await this.infoRepository.set(INFO.KEY.BLOCK_TO_PARSE_NUMBER, this.current);
	}

	public async *start(current?: number): AsyncIterableIterator<Block> {
		this.current = (current || current === 0)
			? current
			: await this.infoRepository.get(INFO.KEY.BLOCK_TO_PARSE_NUMBER);
		this.last = await this.echoRepository.getLastBlockNum(); // Not needed
		this.subscribeToNewBlock();

		this.stage = STAGE.HISTORY;
		this.enableSpeedo();
		while (this.current <= this.last) {
			this.caching(this.current);
			yield this.get(this.current);
		}

		this.disableSpeedo();
		this.stage = STAGE.LIVE;
		logger.info(`${STAGE.LIVE} stage has come`);
		while (true) {
			await this.waitForNewBlock();
			yield this.pureGet(this.current);
		}
	}

	private lastCached: number;
	private async caching(num: number) {
		if (!this.lastCached) this.lastCached = num;
		const toCacheCount = num + this.maxCacheSize - this.lastCached;
		if (toCacheCount <= 0) return;
		const lastBatchSize = toCacheCount % BATCH_SIZE;
		const batchCount = (toCacheCount - lastBatchSize) / BATCH_SIZE + (lastBatchSize ? 1 : 0);
		for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
			const startFrom = this.lastCached + 1 + BATCH_SIZE * batchIndex;
			const until = batchIndex === batchCount ? toCacheCount % BATCH_SIZE : BATCH_SIZE;
			for (let blockNumAdder = 0; blockNumAdder < until; blockNumAdder += 1) {
				this.cacheBlock(startFrom + blockNumAdder);
				this.lastCached += 1;
			}
		}
	}

	private cacheBlock(num: number): void {
		if (!this.cache.has(num)) this.cache.set(num, this.echoRepository.getBlock(num));
	}

	private get(num: number): Promise<Block> {
		return this.cache.has(num) ? this.cache.get(num) : this.pureGet(num);
	}

	private pureGet(num: number): Promise<Block> {
		return this.echoRepository.getBlock(num);
	}

	// speedometer
	private speedo(prevCurrent?: number) {
		const current = this.current;
		if (prevCurrent) {
			const diff = this.current - prevCurrent;
			let toLog = `#${this.current} block | ${diff} blocks per ${config.parser.speedo.delay}ms`;
			if (config.parser.speedo.logCacheSize) toLog += ` | cache size ${this.cache.size}`;
			logger.trace(toLog);
		}
		this.speedoTimeout = setTimeout(() => this.speedo(current), config.parser.speedo.delay);
	}

	private enableSpeedo() {
		this.speedo();
	}

	private disableSpeedo() {
		logger.info('disabling block.engine speedo');
		clearTimeout(this.speedoTimeout);
	}
}
