import { GraphQLSchema, printSchema } from 'graphql';
import {
  DynamicModule,
  Inject,
  Module,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
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
import { extend, generateString } from '@nestjs/graphql/dist/utils';
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
import { MercuriusCoreModule } from './mercurius-core.module';
import { GraphQLFactory } from './factories/graphql.factory';
import { BaseMercuriusModule } from './base-mercurius.module';

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
export class MercuriusModule
  extends BaseMercuriusModule<MercuriusModuleOptions>
  implements OnModuleInit {
  constructor(
    private readonly graphqlFactory: GraphQLFactory,
    private readonly graphqlTypesLoader: GraphQLTypesLoader,
    @Inject(GRAPHQL_MODULE_OPTIONS)
    protected readonly options: MercuriusModuleOptions,
    protected readonly applicationConfig: ApplicationConfig,
    protected readonly httpAdapterHost: HttpAdapterHost,
  ) {
    super(httpAdapterHost, applicationConfig, options);
  }

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

    const mercuriusOptions = ((await this.graphqlFactory.mergeOptions({
      ...this.options,
      typeDefs: mergedTypeDefs,
    } as any)) as unknown) as MercuriusModuleOptions;

    if (
      this.options.definitions &&
      this.options.definitions.path &&
      mercuriusOptions.schema instanceof GraphQLSchema
    ) {
      await this.graphqlFactory.generateDefinitions(
        printSchema(mercuriusOptions.schema),
        this.options as any,
      );
    }
    await this.registerGqlServer(mercuriusOptions);
  }
}
