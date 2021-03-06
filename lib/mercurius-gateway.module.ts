import {
  DynamicModule,
  Inject,
  Module,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { GRAPHQL_GATEWAY_MODULE_OPTIONS } from '@nestjs/graphql/dist/federation/federation.constants';
import { GRAPHQL_MODULE_ID } from '@nestjs/graphql/dist/graphql.constants';
import { generateString } from '@nestjs/graphql/dist/utils';
import { HttpAdapterHost, ApplicationConfig } from '@nestjs/core';
import { BaseMercuriusModule } from './base-mercurius.module';
import {
  MercuriusGatewayModuleAsyncOptions,
  MercuriusGatewayModuleOptions,
  MercuriusGatewayOptionsFactory,
} from './interfaces';
import { HookExplorerService } from './services';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';

@Module({
  providers: [MetadataScanner, HookExplorerService],
})
export class MercuriusGatewayModule
  extends BaseMercuriusModule<MercuriusGatewayModuleOptions>
  implements OnModuleInit
{
  constructor(
    protected readonly httpAdapterHost: HttpAdapterHost,
    protected readonly applicationConfig: ApplicationConfig,
    @Inject(GRAPHQL_GATEWAY_MODULE_OPTIONS)
    protected readonly options: MercuriusGatewayModuleOptions,
    protected readonly hookExplorerService: HookExplorerService,
  ) {
    super(httpAdapterHost, applicationConfig, options, hookExplorerService);
  }

  static forRoot(options: MercuriusGatewayModuleOptions): DynamicModule {
    return {
      module: MercuriusGatewayModule,
      providers: [
        {
          provide: GRAPHQL_GATEWAY_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(
    options: MercuriusGatewayModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: MercuriusGatewayModule,
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
    options: MercuriusGatewayModuleAsyncOptions,
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
    options: MercuriusGatewayModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: GRAPHQL_GATEWAY_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: GRAPHQL_GATEWAY_MODULE_OPTIONS,
      useFactory: (optionsFactory: MercuriusGatewayOptionsFactory) =>
        optionsFactory.createMercuriusGatewayOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  async onModuleInit() {
    const { httpAdapter } = this.httpAdapterHost || {};
    if (!httpAdapter) {
      return;
    }

    await this.registerGqlServer(this.options);
  }
}
