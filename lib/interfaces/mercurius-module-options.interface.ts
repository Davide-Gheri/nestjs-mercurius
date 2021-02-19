import {
  BuildSchemaOptions,
  DefinitionsGeneratorOptions,
  Enhancer,
} from '@nestjs/graphql';
import { ModuleMetadata, Type } from '@nestjs/common';
import { GraphQLSchema } from 'graphql';
import { IResolverValidationOptions } from '@nestjs/graphql/dist/interfaces/gql-module-options.interface';
import { MercuriusSchemaOptions } from 'mercurius';
import { BaseMercuriusModuleOptions } from './base-mercurius-module-options.interface';

export interface MercuriusModuleOptions
  extends Omit<MercuriusSchemaOptions, 'schema'>,
    BaseMercuriusModuleOptions {
  schema?: GraphQLSchema | string;
  path?: string;
  typeDefs?: string | string[];
  typePaths?: string[];
  include?: Function[];
  resolverValidationOptions?: IResolverValidationOptions;
  directiveResolvers?: any;
  schemaDirectives?: Record<string, any>;
  transformSchema?: (
    schema: GraphQLSchema,
  ) => GraphQLSchema | Promise<GraphQLSchema>;
  definitions?: {
    path?: string;
    outputAs?: 'class' | 'interface';
  } & DefinitionsGeneratorOptions;
  autoSchemaFile?: boolean | string;
  buildSchemaOptions?: BuildSchemaOptions;
  transformAutoSchemaFile?: boolean;
  sortSchema?: boolean;
  fieldResolverEnhancers?: Enhancer[];
}

export interface MercuriusOptionsFactory {
  createMercuriusOptions():
    | Promise<MercuriusModuleOptions>
    | MercuriusModuleOptions;
}

export interface MercuriusModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MercuriusOptionsFactory>;
  useClass?: Type<MercuriusOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MercuriusModuleOptions> | MercuriusModuleOptions;
  inject?: any[];
}
