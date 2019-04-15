import EchoConnection from '../connections/echo.connection';
import * as ECHO from '../constants/echo.constants';
import * as ERC20 from '../constants/erc20.constants';
import { Block } from 'echojs-lib';
import { encode, decode } from 'echojs-contract';
import { AccountId, ContractId, AssetId } from '../types/echo';
import RavenHelper from 'helpers/raven.helper';

export default class EchoRepository {

	constructor(
		readonly echoConnection: EchoConnection,
		readonly ravenHelper: RavenHelper,
	) {}

	async getBlock(blockNum: number): Promise<Block> {
		try {
			return await this.echoConnection.echo.api.getBlock(blockNum);
		} catch (error) {
			// TODO: raven
			throw error;
		}
	}

	async getLastBlockNum(): Promise<number> {
		try {
			const { last_irreversible_block_num: lastBlockNum } =
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
			address,
			ECHO.CORE_ASSET,
			// FIXME: use constant
			ERC20.METHOD.HASH.BALANCE_OF + encode({ value: address, type: 'address' }),
		);
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
			this.ravenHelper.error(error, 'echoRepository#getTokenName');
			return null;
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
			this.ravenHelper.error(error, 'echoRepository#getTokenSymbol');
			return null;
		}
	}

	async getAssetDynamicDataId(assetId: AssetId) {
		try {
			const [assetData] = await this.echoConnection.echo.api.getAssets([assetId]);
			return assetData.dynamic_asset_data_id;
		} catch (error) {
			this.ravenHelper.error(error, 'echoRepository#getAssetDynamicDataId', { assetId });
			return null;
		}
	}

	subscribeToBlockApply(cb: (block: Block) => void) {
		this.echoConnection.echo.subscriber.setBlockApplySubscribe(cb);
	}

	getContractResult(resultId: string) {
		return this.echoConnection.echo.api.getContractResult(resultId);
	}

}
