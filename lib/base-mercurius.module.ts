import { MercuriusModuleOptions } from './interfaces';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { FastifyInstance } from 'fastify';
import { MercuriusOptions } from 'mercurius';
import { normalizeRoutePath } from '@nestjs/graphql/dist/utils';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { BaseMercuriusModuleOptions } from './interfaces/base-mercurius-module-options.interface';

export abstract class BaseMercuriusModule<
  Opts extends BaseMercuriusModuleOptions
> {
  constructor(
    protected readonly httpAdapterHost: HttpAdapterHost,
    protected readonly applicationConfig: ApplicationConfig,
    protected readonly options: Opts,
  ) {}

  protected async registerGqlServer(mercuriusOptions: Opts) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const platformName = httpAdapter.getType();

    if (platformName === 'fastify') {
      await this.registerFastify(mercuriusOptions);
    } else {
      throw new Error(`No support for current HttpAdapter: ${platformName}`);
    }
  }

  protected async registerFastify(mercuriusOptions: Opts) {
    const mercurius = loadPackage('mercurius', 'MercuriusModule', () =>
      require('mercurius'),
    );

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const app: FastifyInstance = httpAdapter.getInstance();

    const options = {
      ...mercuriusOptions,
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

  protected getNormalizedPath(mercuriusOptions: Opts): string {
    const prefix = this.applicationConfig.getGlobalPrefix();
    const useGlobalPrefix = prefix && this.options.useGlobalPrefix;
    const gqlOptionsPath = normalizeRoutePath(mercuriusOptions.path);
    return useGlobalPrefix
      ? normalizeRoutePath(prefix) + gqlOptionsPath
      : gqlOptionsPath;
  }
}
