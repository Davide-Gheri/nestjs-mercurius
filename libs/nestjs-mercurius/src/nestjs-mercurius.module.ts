import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { GRAPHQL_MODULE_OPTIONS } from './constants';
import { GqlModuleOptions } from './interfaces';
import {
  GraphQLFactory,
  GraphQLTypesLoader,
  GraphQLSchemaBuilderModule,
  GraphQLAstExplorer,
  GraphQLSchemaHost,
} from '@nestjs/graphql';

import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import {
  PluginsExplorerService,
  ResolversExplorerService,
  ScalarsExplorerService,
} from '@nestjs/graphql/dist/services';
import { GraphQLSchemaBuilder } from '@nestjs/graphql/dist/graphql-schema.builder';
import { extend, normalizeRoutePath } from '@nestjs/graphql/dist/utils';
import { printSchema } from 'graphql';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { MercuriusOptions } from 'mercurius';
import { FastifyInstance } from 'fastify';

@Module({
  imports: [
    GraphQLSchemaBuilderModule,
  ],
  providers: [
    GraphQLFactory,
    MetadataScanner,
    ResolversExplorerService,
    ScalarsExplorerService,
    PluginsExplorerService,
    GraphQLAstExplorer,
    GraphQLTypesLoader,
    GraphQLSchemaBuilder,
    GraphQLSchemaHost,
  ]
})
export class NestjsMercuriusModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(GRAPHQL_MODULE_OPTIONS) private readonly options: GqlModuleOptions,
    private readonly graphqlFactory: GraphQLFactory,
    private readonly graphqlTypesLoader: GraphQLTypesLoader,
    private readonly applicationConfig: ApplicationConfig,
  ) {}

  static forRoot(options: GqlModuleOptions) {
    return {
      module: NestjsMercuriusModule,
      providers: [
        {
          provide: GRAPHQL_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  async onModuleInit() {
    if (!this.httpAdapterHost) {
      return;
    }
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter) {
      return;
    }
    const typeDefs =
      (await this.graphqlTypesLoader.mergeTypesByPaths(
        this.options.typePaths,
      )) || [];
    const mergedTypeDefs = extend(typeDefs, this.options.typeDefs);
    const apolloOptions = await this.graphqlFactory.mergeOptions({
      ...this.options,
      typeDefs: mergedTypeDefs,
    });

    console.log(apolloOptions)

    await this.runExecutorFactoryIfPresent(apolloOptions);

    if (this.options.definitions && this.options.definitions.path) {
      await this.graphqlFactory.generateDefinitions(
        printSchema(apolloOptions.schema),
        this.options,
      );
    }
    await this.registerGqlServer(apolloOptions);
  }

  private async registerGqlServer(mercuriusOptions: GqlModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const platformName = httpAdapter.getType();

    if (platformName === 'fastify') {
      await this.registerFastify(mercuriusOptions);
    } else {
      throw new Error(`No support for current HttpAdapter: ${platformName}`);
    }
  }

  private async registerFastify(mercuriusOptions: GqlModuleOptions) {
    const mercurius = loadPackage(
      'mercurius',
      'GraphQLModule',
      () => require('mercurius'),
    );

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app: FastifyInstance = httpAdapter.getInstance();
    const path = this.getNormalizedPath(mercuriusOptions);

    const options: MercuriusOptions = {
      graphiql: 'playground',
      routes: true,
      defineMutation: true,
      schema: mercuriusOptions.schema,
      path,
      loaders: {
        UserType: {
          fullName: (query) => {
            console.log(query);
            return query.map(q => 'eee')
          }
        }
      }
    }

    await app.register(mercurius, options);
  }

  private getNormalizedPath(apolloOptions: GqlModuleOptions): string {
    const prefix = this.applicationConfig.getGlobalPrefix();
    const useGlobalPrefix = prefix && this.options.useGlobalPrefix;
    const gqlOptionsPath = normalizeRoutePath(apolloOptions.path);
    return useGlobalPrefix
      ? normalizeRoutePath(prefix) + gqlOptionsPath
      : gqlOptionsPath;
  }

  private async runExecutorFactoryIfPresent(mercuriusOptions: GqlModuleOptions) {
    if (!mercuriusOptions.executorFactory) {
      return;
    }
    const executor = await mercuriusOptions.executorFactory(mercuriusOptions.schema);
    mercuriusOptions.executor = executor;
  }
}
