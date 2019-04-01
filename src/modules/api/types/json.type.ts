// import { GraphQLScalarType } from 'graphql';
// import { Kind } from 'graphql/language';

// export default class Json extends GraphQLScalarType {
// 	name = 'JSON';
// 	description = 'The `JSON` scalar type represents JSON values as specified by [ECMA-404]';
// 	serialize = this.identity;
// 	parseValue = this.identity;

// 	identity(value: any) {
// 		return value;
// 	}

// 	parseLiteral(ast: any, variables: any) {
// 		switch (ast.kind) {
// 			case Kind.STRING:
// 			case Kind.BOOLEAN:
// 			  return ast.value;
// 			case Kind.INT:
// 			case Kind.FLOAT:
// 			  return parseFloat(ast.value);
// 			case Kind.OBJECT: {
// 			  const value = Object.create(null);
// 			  for (const field of ast.fields) {
// 				value[field.name.value] = this.parseLiteral(field.value, variables);
// 			  }
// 			  return value;
// 			}
// 			case Kind.LIST:
// 			  return ast.values.map((item: any) => this.parseLiteral(item, variables));
// 			case Kind.NULL:
// 			  return null;
// 			case Kind.VARIABLE: {
// 			  const name = ast.name.value;
// 			  return variables ? variables[name] : undefined;
// 			}
// 			default:
// 			  return undefined;
// 		  }
// 	}
// }
