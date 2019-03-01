import AbstractModule from '../abstract.module';
import InfoRepository from '../../repositories/info.repository';
import * as INFO from '../../constants/info.constants';
import EchoRepository from '../../repositories/echo.repository';
import Queue from '../../utils/queue';
import EchoService from 'services/echo.service';

export default class ParserModule extends AbstractModule {
	constructor(
		readonly infoRepository: InfoRepository,
		readonly echoRepository: EchoRepository,
		readonly echoService: EchoService,
	) {
		super();
	}

	async init() {
		this.start();
	}

	async start(): Promise<void> {
		const [lastParsedBlockNum, lastBlockNum] = await Promise.all([
			this.infoRepository.get(INFO.KEY.LAST_PARSED_BLOCK_NUMBER),
			this.echoRepository.getLastBlockNum(),
		]);

		// TODO: remove this block
		const startTime = new Date().getTime();
		const startBlockCount = lastParsedBlockNum;
		process.on('SIGINT', async () => {
			console.log('time passed:', Number((new Date().getTime() - startTime) / 60000).toFixed(2), 'minutes');
			console.log('block parsed:',
				await this.infoRepository.get(INFO.KEY.LAST_PARSED_BLOCK_NUMBER) - startBlockCount);
			process.exit(0);
		  });

		const queue = new Queue<number>();
		for (let i = lastParsedBlockNum + 1; i < lastBlockNum; i += 1) {
			queue.push(i);
		}
		console.log('size', queue.size);

		while (queue.size) {
			const blockNum = queue.pop();
			const block = await this.echoRepository.getBlock(blockNum);
			await this.echoService.parseBlock(block);
			this.infoRepository.set(INFO.KEY.LAST_PARSED_BLOCK_NUMBER, blockNum);
			console.log(queue.size);
		}
		console.log('DONE', queue.size);
	}

}
