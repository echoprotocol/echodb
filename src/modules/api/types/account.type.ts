import AccountAuthority from './account.authority.type';
import AccountOptions from './account.options.type';
import AccountId from './account.id.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Account {
	@Field(() => AccountId) id: string;
	@Field() membership_expiration_date: string;
	@Field() registrar: Account;
	@Field() referrer: Account;
	@Field() lifetime_referrer: Account;
	@Field() network_fee_percentage: number;
	@Field() lifetime_referrer_fee_percentage: number;
	@Field() referrer_rewards_percentage: number;
	@Field() name: string;
	@Field() owner: AccountAuthority;
	@Field() active: AccountAuthority;
	@Field() ed_key: string;
	@Field() options: AccountOptions;
	@Field() statistics: string;
	@Field() top_n_control_flags: number;

	@Field(() => [String])
	whitelisting_accounts: string[];

	@Field(() => [String])
	blacklisting_accounts: unknown[];

	@Field(() => [String])
	whitelisted_accounts: unknown[];

	@Field(() => [String])
	blacklisted_accounts: unknown[];

	@Field(() => [Number, {}])
	owner_special_authority: [number, {}];

	@Field(() => [Number, {}])
	active_special_authority: [number, {}];
}
