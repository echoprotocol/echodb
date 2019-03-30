import { Field, ObjectType, Int, ClassType } from 'type-graphql';

export default function <T>(type: ClassType<T>) {
	@ObjectType(`Paginated${type.name}Response`)
	class PaginatedResponse {

		@Field(() => [type])
		items: T[];

		@Field(() => Int)
		total: number;

	}
	return PaginatedResponse;
}
