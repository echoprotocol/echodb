import * as API from '../../constants/api.constants';
import * as BALANCE from '../../constants/balance.constants';
import * as CONTRACT from '../../constants/contract.constants';
import * as ECHO from '../../constants/echo.constants';
import * as TOKEN from '../../constants/token.constants';
import { registerEnumType } from 'type-graphql';

registerEnumType(API.SORT_DESTINATION, {
	name: 'SortDestinationEnum',
	description: 'Destination of sort',
});

registerEnumType(BALANCE.TYPE, {
	name: 'BalanceTypeEnum',
	description: 'Type of a balance',
});

registerEnumType(CONTRACT.TYPE, {
	name: 'ContractTypeEnum',
	description: 'Type of a contract',
});

registerEnumType(ECHO.OPERATION_ID, {
	name: 'OperationIdEnum',
	description: 'Type of an operation',
});

registerEnumType(TOKEN.TYPE, {
	name: 'TokenTypeEnum',
	description: 'Type of a token',
});
