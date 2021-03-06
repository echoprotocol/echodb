import AccountAuthority from './account.authority.type';
import AccountOptions from './account.options.type';
import AccountCommitteeOptions from './account.committee.options.type';
import AccountId from './account.id.type';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export default class Account {
	@Field(() => AccountId, { nullable: true }) id: string;
	@Field(() => Account) registrar: string;
	@Field() network_fee_percentage: number;
	@Field({ nullable: true }) name: string;
	@Field() owner: AccountAuthority;
	@Field() active: AccountAuthority;
	@Field() echorand_key: string;
	@Field() options: AccountOptions;
	@Field() statistics: string;
	@Field() top_n_control_flags: number;
	@Field() concentration_balance_rate?: number;
	@Field() concentration_history_rate?: number;
	@Field(() => AccountCommitteeOptions, { nullable: true }) committee_options: AccountCommitteeOptions;

	@Field() evm_address: string;

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
