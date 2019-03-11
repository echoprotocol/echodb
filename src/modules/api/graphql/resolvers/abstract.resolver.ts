import { GraphqlInitProps } from '../graphql.schema';

export default abstract class AbstractResolver {

	abstract init(fns: GraphqlInitProps): void;

}
