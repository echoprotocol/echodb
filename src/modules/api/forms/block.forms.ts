import AbstractForm from './abstract.form';
import * as API from '../../../constants/api.constants';
import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class BlockForm extends AbstractForm {
	@Field(() => Int, { nullable: false })
	round: number;
}

@ArgsType()
export class BlocksForm extends AbstractForm {
	@Field(() => Int, { defaultValue: API.PAGINATION.DEFAULT_COUNT })
	count: number;

	@Field(() => Int, { defaultValue: 0 })
	offset: number;
}
