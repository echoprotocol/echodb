import EchoConnection from '../connections/echo.connection';
import * as ECHO from '../constants/echo.constants';
import * as ERC20 from '../constants/erc20.constants';
import { Block, Asset, BlockVirtualOperation } from 'echojs-lib';
import { encode, decode } from 'echojs-contract';
import { AccountId, ContractId, AssetId } from '../types/echo';
import RavenHelper from 'helpers/raven.helper';
import ProcessingError from '../errors/processing.error';

export default class EchoRepository {

	constructor(
		readonly echoConnection: EchoConnection,
		readonly ravenHelper: RavenHelper,
	) {}

	async getBlock(blockNum: number): Promise<Block> {
		try {
			return await this.echoConnection.echo.api.getBlock(blockNum);
		} catch (error) {
			throw this.ravenHelper.error(error, 'echoRepository#getBlock');
		}
	}

	async getBlockVirtualOperations(blockNum: number): Promise<[BlockVirtualOperation]> {
		try {
			return await this.echoConnection.echo.api.getBlockVirtualOperations(blockNum);
		} catch (error) {
			throw this.ravenHelper.error(error, 'echoRepository#getBlockVirtualOperations');
		}
	}

	async getBlockVirtualOperationsMap(blockNum: number): Promise<Map<number, BlockVirtualOperation[]>> {
		const virtualOperations = await this.echoConnection.echo.api.getBlockVirtualOperations(blockNum);
		return virtualOperations.reduce((map, operation) => {
			const txIndex = operation.trx_in_block;
			if (map.has(txIndex)) map.get(txIndex).push(operation);
			else map.set(txIndex, [operation]);
			return map;
		}, new Map<number, BlockVirtualOperation[]>());
	}

	async getAssets(assets: string[]): Promise<Asset[]> {
		try {
			return await this.echoConnection.echo.api.getAssets(assets);
		} catch (error) {
			// TODO: raven
			throw error;
		}
	}

	async getLastBlockNum(): Promise<number> {
		try {
			const { head_block_number: lastBlockNum } =
				await this.echoConnection.echo.api.getDynamicGlobalProperties();
			return lastBlockNum;
		} catch (error) {
			// TODO: raven here
			throw error;
		}
	}

	async getAccountTokenBalance(contractId: ContractId, address: AccountId) {
		const hexValue = await this.echoConnection.echo.api.callContractNoChangingState(
			contractId,
			'1.2.1',
			ECHO.CORE_ASSET,
			// FIXME: use constant
			ERC20.METHOD.HASH.BALANCE_OF + encode({ value: address, type: 'address' }),
		);

		if (!hexValue) {
			return '';
		}

		return decode(hexValue, ERC20.METHOD.RESULT_TYPE.BALANCE_OF).toString();
	}

	// TODO: concat 3 following method into 1
	// TODO: refactor 3 following methods throwing error
	async getTokenTotalSupply(contractId: ContractId) {
		try {
			const hex = await this.echoConnection.echo.api.callContractNoChangingState(
				contractId,
				// FIXME: needed to use any accountId here
				'1.2.1',
				ECHO.CORE_ASSET,
				ERC20.METHOD.HASH.TOTAL_SUPPLY,
			);
			return <string>decode(hex, ERC20.METHOD.RESULT_TYPE.TOTAL_SUPPLY).toString();
		} catch (error) {
			this.ravenHelper.error(error, 'echoRepository#getTokenTotalSupply');
			return null;
		}
	}

	async getTokenName(contractId: ContractId) {
		try {
			const hex = await this.echoConnection.echo.api.callContractNoChangingState(
				contractId,
				// FIXME: needed to use any accountId here
				'1.2.1',
				ECHO.CORE_ASSET,
				ERC20.METHOD.HASH.NAME,
			);
			return <string>decode(hex, ERC20.METHOD.RESULT_TYPE.NAME);
		} catch (error) {
			return '';
		}
	}

	async getTokenSymbol(contractId: ContractId) {
		try {
			const hex = await this.echoConnection.echo.api.callContractNoChangingState(
				contractId,
				// FIXME: needed to use any accountId here
				'1.2.1',
				ECHO.CORE_ASSET,
				ERC20.METHOD.HASH.SYMBOL,
			);
			return <string>decode(hex, ERC20.METHOD.RESULT_TYPE.SYMBOL);
		} catch (error) {
			return '';
		}
	}

	async getAsset(assetId: AssetId) {
		try {
			const [assetData] = await this.echoConnection.echo.api.getAssets([assetId]);
			return assetData;
		} catch (error) {
			this.ravenHelper.error(error, 'echoRepository#getAsset', { assetId });
			throw new ProcessingError(error);
		}
	}

	async getTokenDecimals(contractId: ContractId) {
		try {
			const hex = await this.echoConnection.echo.api.callContractNoChangingState(
				contractId,
				// FIXME: needed to use any accountId here
				'1.2.1',
				ECHO.CORE_ASSET,
				ERC20.METHOD.HASH.DECIMALS,
			);
			return <string>decode(hex, ERC20.METHOD.RESULT_TYPE.DECIMALS).toString();
		} catch (error) {
			return '0';
		}
	}

	subscribeToBlockApply(cb: (block: Block) => void) {
		this.echoConnection.echo.subscriber.setBlockApplySubscribe(cb);
	}

	// FIXME: refactor
	async subscribeToNewBlock(cb: (num: number) => void) {
		this.echoConnection.echo.subscriber.setGlobalSubscribe((data: any) => {
			if (data[0].id === '2.1.0') {
				console.log(data[0].head_block_number);
			}
			if (!data || !data[0] || data[0].id !== '2.1.0') return;
			cb(data[0].head_block_number);
		});
		this.echoConnection.echo.subscriber.setStatusSubscribe(ECHO.CONNECT_STATUS, async () => {
			await this.echoConnection.echo.api.getObject('2.1.0');
		});
		await this.echoConnection.echo.api.getObject('2.1.0');
	}

	getContractResult(resultId: string) {
		return this.echoConnection.echo.api.getContractResult(resultId);
	}

	async getAccountCount() {
		try {
			return await this.echoConnection.echo.api.getAccountCount();
		} catch (error) {
			throw this.ravenHelper.error(error, 'echoRepository#getAccountCount');
		}
	}

	async getAccounts(ids: AccountId[]) {
		try {
			return await this.echoConnection.echo.api.getAccounts(ids);
		} catch (error) {
			throw this.ravenHelper.error(error, 'parseModule#getAccountBatch', { ids });
		}
	}

}
