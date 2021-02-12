import { GraphQLDirective, GraphQLScalarType } from 'graphql';
import { FieldMiddleware } from './field-middleware.interface';

export type DateScalarMode = 'isoDate' | 'timestamp';
export type NumberScalarMode = 'float' | 'integer';

export interface ScalarsTypeMap {
  type: Function;
  scalar: GraphQLScalarType;
}

export interface BuildSchemaOptions {
  /**
   * Date scalar mode
   * @default 'isoDate'
   */
  dateScalarMode?: DateScalarMode;

  /**
   * Number scalar mode
   * @default 'float'
   */
  numberScalarMode?: NumberScalarMode;

  /**
   * Scalars map
   */
  scalarsMap?: ScalarsTypeMap[];

  /**
   * Orphaned type classes that are not explicitly used in GraphQL types definitions
   */
  orphanedTypes?: Function[];

  /**
   * Disable checking on build the correctness of a schema
   */
  skipCheck?: boolean;

  /**
   * GraphQL directives
   */
  directives?: GraphQLDirective[];

  /**
   * GraphQL schema directives mapping
   */
  schemaDirectives?: Record<string, any>;

  /**
   * Array of global field middleware functions
   */
  fieldMiddleware?: FieldMiddleware[];
}
