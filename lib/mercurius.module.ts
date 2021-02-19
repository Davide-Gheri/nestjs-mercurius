import { printSchema } from 'graphql';
import { MercuriusOptions } from 'mercurius';
import { FastifyInstance } from 'fastify';
import {
  DynamicModule,
  Inject,
  Module,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import {
  GraphQLTypesLoader,
  GraphQLSchemaBuilderModule,
  GraphQLAstExplorer,
  GraphQLSchemaHost,
} from '@nestjs/graphql';
import {
  PluginsExplorerService,
  ResolversExplorerService,
  ScalarsExplorerService,
} from '@nestjs/graphql/dist/services';
import {
  GRAPHQL_MODULE_OPTIONS,
  GRAPHQL_MODULE_ID,
} from '@nestjs/graphql/dist/graphql.constants';
import { GraphQLSchemaBuilder } from '@nestjs/graphql/dist/graphql-schema.builder';
import {
  extend,
  generateString,
  normalizeRoutePath,
} from '@nestjs/graphql/dist/utils';
import {
  MercuriusModuleAsyncOptions,
  MercuriusModuleOptions,
  MercuriusOptionsFactory,
} from './interfaces';
import {
  LoadersExplorerService,
  ValidationRuleExplorerService,
} from './services';
import { mergeDefaults } from './utils/merge-defaults';
import { GraphQLFactory } from './graphql.factory';
import { MercuriusCoreModule } from './mercurius-core.module';

@Module({
  imports: [GraphQLSchemaBuilderModule, MercuriusCoreModule],
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
    LoadersExplorerService,
    ValidationRuleExplorerService,
  ],
})
export class MercuriusModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(GRAPHQL_MODULE_OPTIONS)
    private readonly options: MercuriusModuleOptions,
    private readonly graphqlFactory: GraphQLFactory,
    private readonly graphqlTypesLoader: GraphQLTypesLoader,
    private readonly applicationConfig: ApplicationConfig,
  ) {}

  static forRoot(options: MercuriusModuleOptions) {
    options = mergeDefaults(options);
    return {
      module: MercuriusModule,
      providers: [
        {
          provide: GRAPHQL_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: MercuriusModuleAsyncOptions): DynamicModule {
    return {
      module: MercuriusModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: GRAPHQL_MODULE_ID,
          useValue: generateString(),
        },
      ],
    };
  }

  private static createAsyncProviders(
    options: MercuriusModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: MercuriusModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: GRAPHQL_MODULE_OPTIONS,
        useFactory: async (...args: any[]) =>
          mergeDefaults(await options.useFactory(...args)),
        inject: options.inject || [],
      };
    }
    return {
      provide: GRAPHQL_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MercuriusOptionsFactory) =>
        mergeDefaults(await optionsFactory.createMercuriusOptions()),
      inject: [options.useExisting || options.useClass],
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
    const mercuriusOptions = (await this.graphqlFactory.mergeOptions({
      ...this.options,
      typeDefs: mergedTypeDefs,
    })) as MercuriusModuleOptions;

    if (this.options.definitions && this.options.definitions.path) {
      await this.graphqlFactory.generateDefinitions(
        printSchema(mercuriusOptions.schema),
        this.options as any,
      );
    }
    await this.registerGqlServer(mercuriusOptions);
  }

  private async registerGqlServer(mercuriusOptions: MercuriusModuleOptions) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const platformName = httpAdapter.getType();

    if (platformName === 'fastify') {
      await this.registerFastify(mercuriusOptions);
    } else {
      throw new Error(`No support for current HttpAdapter: ${platformName}`);
    }
  }

  private async registerFastify(mercuriusOptions: MercuriusModuleOptions) {
    const mercurius = loadPackage('mercurius', 'MercuriusModule', () =>
      require('mercurius'),
    );

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app: FastifyInstance = httpAdapter.getInstance();

    const options: MercuriusOptions = {
      ...mercuriusOptions,
      schema: mercuriusOptions.schema,
      path: this.getNormalizedPath(mercuriusOptions),
    };

    if (mercuriusOptions.uploads) {
      const mercuriusUpload = loadPackage(
        'mercurius-upload',
        'MercuriusModule',
        () => require('mercurius-upload'),
      );
      await app.register(
        mercuriusUpload,
        typeof mercuriusOptions.uploads !== 'boolean'
          ? mercuriusOptions.uploads
          : undefined,
      );
    }

    if (mercuriusOptions.altair) {
      const altairPlugin = loadPackage(
        'altair-fastify-plugin',
        'MercuriusModule',
        () => require('altair-fastify-plugin'),
      );

      options.graphiql = false;
      options.ide = false;

      await app.register(altairPlugin, {
        baseURL: '/altair/',
        path: '/altair',
        ...(typeof mercuriusOptions.altair !== 'boolean' &&
          mercuriusOptions.altair),
        endpointURL: options.path,
      });
    }

    await app.register(mercurius, options);
  }

  private getNormalizedPath(mercuriusOptions: MercuriusModuleOptions): string {
    const prefix = this.applicationConfig.getGlobalPrefix();
    const useGlobalPrefix = prefix && this.options.useGlobalPrefix;
    const gqlOptionsPath = normalizeRoutePath(mercuriusOptions.path);
    return useGlobalPrefix
      ? normalizeRoutePath(prefix) + gqlOptionsPath
      : gqlOptionsPath;
  }
}
