import AccountRepository from '../repositories/account.repository';
import EchoConnection from '../connections/echo.connection';

export default class EchoService {

	constructor(
		readonly accountRepository: AccountRepository,
		readonly echoConnection: EchoConnection,
	) {}

}
