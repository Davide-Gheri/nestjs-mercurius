import {
  BuildSchemaOptions,
  DefinitionsGeneratorOptions,
  Enhancer,
} from '@nestjs/graphql';
import { ModuleMetadata, Type } from '@nestjs/common';
import { GraphQLSchema } from 'graphql';
import { IResolverValidationOptions } from '@nestjs/graphql/dist/interfaces/gql-module-options.interface';
import { MercuriusCommonOptions, MercuriusSchemaOptions } from 'mercurius';

export interface MercuriusModuleOptions extends Omit<MercuriusSchemaOptions, 'schema'>, MercuriusCommonOptions {
  schema?: GraphQLSchema;
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
  useGlobalPrefix?: boolean;
  transformAutoSchemaFile?: boolean;
  sortSchema?: boolean;
  fieldResolverEnhancers?: Enhancer[];

  uploads?: boolean;
  altair?: boolean | import('altair-fastify-plugin').AltairFastifyPluginOptions;
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
