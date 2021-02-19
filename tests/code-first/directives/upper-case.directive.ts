import { SchemaDirectiveVisitor } from '@graphql-tools/utils';
import {
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
  defaultFieldResolver,
} from 'graphql';

export class UpperCaseDirective extends SchemaDirectiveVisitor {
  name = 'uppercase';
  visitFieldDefinition(
    field: GraphQLField<any, any>,
    _details: { objectType: GraphQLObjectType | GraphQLInterfaceType },
  ): GraphQLField<any, any> | void | null {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}
