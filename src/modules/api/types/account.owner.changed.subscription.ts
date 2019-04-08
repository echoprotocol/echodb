import Account from './account.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class AccountOwnerChangedSubscription {
	@Field() old: Account;
	@Field() new: Account;
}
