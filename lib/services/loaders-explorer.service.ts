import { Inject, Injectable } from '@nestjs/common';
import { BaseExplorerService } from '@nestjs/graphql/dist/services';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { head, identity } from 'lodash';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import {
  ContextId,
  InstanceWrapper,
} from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { extractMetadata } from '../utils/extract-metadata.util';
import { createContextId, DiscoveryService, REQUEST } from '@nestjs/core';
import {
  PARAM_ARGS_METADATA,
  GRAPHQL_MODULE_OPTIONS,
  FIELD_RESOLVER_MIDDLEWARE_METADATA,
} from '@nestjs/graphql/dist/graphql.constants';
import { MercuriusGqlParamsFactory } from '../factories/params.factory';
import { MercuriusModuleOptions } from '../interfaces';
import { MercuriusParamType } from '../mercurius-param-type.enum';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { Injector } from '@nestjs/core/injector/injector';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import { GraphQLResolveInfo } from 'graphql';
import { decorateFieldResolverWithMiddleware } from '@nestjs/graphql/dist/utils/decorate-field-resolver.util';

interface LoaderMetadata {
  type: string;
  methodName: string;
  name: string;
  callback: Function;
}

@Injectable()
export class LoadersExplorerService extends BaseExplorerService {
  private readonly gqlParamsFactory = new MercuriusGqlParamsFactory();
  private readonly injector = new Injector();

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly discoveryService: DiscoveryService,
    @Inject(GRAPHQL_MODULE_OPTIONS)
    private readonly gqlOptions: MercuriusModuleOptions,
  ) {
    super();
  }

  explore() {
    const modules = this.getModules(
      this.modulesContainer,
      this.gqlOptions.include || [],
    );

    const loaders = this.flatMap(modules, (instance, moduleRef) =>
      this.filterLoaders(instance, moduleRef),
    );

    return loaders.reduce((acc, loader) => {
      if (!acc[loader.type]) {
        acc[loader.type] = {};
      }
      acc[loader.type][loader.name] = {
        loader: loader.callback,
      };
      return acc;
    }, {});
  }

  filterLoaders(wrapper: InstanceWrapper, moduleRef: Module): LoaderMetadata[] {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    const prototype = Object.getPrototypeOf(instance);
    const predicate = (resolverType: string, isLoaderResolver: boolean) => {
      if (!isUndefined(resolverType)) {
        return !isLoaderResolver;
      }
      return true;
    };

    const loaders = this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (name) => {
        return extractMetadata(instance, prototype, name, predicate);
      },
    );
    const isRequestScoped = !wrapper.isDependencyTreeStatic();
    return loaders
      .filter((loader) => !!loader)
      .map((loader) => {
        const createContext = (transform?: Function) =>
          this.createContextCallback(
            instance,
            prototype,
            wrapper,
            moduleRef,
            loader,
            isRequestScoped,
            transform,
          );
        return {
          ...loader,
          callback: createContext(),
        };
      });
  }

  createContextCallback<T extends Record<string, any>>(
    instance: T,
    prototype: any,
    wrapper: InstanceWrapper,
    moduleRef: Module,
    resolver: any,
    isRequestScoped: boolean,
    transform: Function = identity,
  ) {
    const paramsFactory = this.gqlParamsFactory;
    const fieldResolverEnhancers = this.gqlOptions.fieldResolverEnhancers || [];

    const contextOptions = {
      guards: fieldResolverEnhancers.includes('guards'),
      filters: fieldResolverEnhancers.includes('filters'),
      interceptors: fieldResolverEnhancers.includes('interceptors'),
    };

    if (isRequestScoped) {
      const loaderCallback = async (...args: any[]) => {
        const gqlContext = paramsFactory.exchangeKeyForValue(
          MercuriusParamType.LOADER_CONTEXT,
          undefined,
          args,
        );
        let contextId: ContextId;
        if (gqlContext && gqlContext[REQUEST_CONTEXT_ID]) {
          contextId = gqlContext[REQUEST_CONTEXT_ID];
        } else if (
          gqlContext &&
          gqlContext.req &&
          gqlContext.req[REQUEST_CONTEXT_ID]
        ) {
          contextId = gqlContext.req[REQUEST_CONTEXT_ID];
        } else {
          contextId = createContextId();
          Object.defineProperty(gqlContext, REQUEST_CONTEXT_ID, {
            value: contextId,
            enumerable: false,
            configurable: false,
            writable: false,
          });
        }

        this.registerContextProvider(gqlContext, contextId);
        const contextInstance = await this.injector.loadPerContext(
          instance,
          moduleRef,
          moduleRef.providers,
          contextId,
        );
        const callback = this.externalContextCreator.create(
          contextInstance,
          transform(contextInstance[resolver.methodName]),
          resolver.methodName,
          PARAM_ARGS_METADATA,
          paramsFactory,
          contextId,
          wrapper.id,
          contextOptions,
          'graphql',
        );
        return callback(...args);
      };

      return this.registerFieldMiddlewareIfExists(
        loaderCallback,
        instance,
        resolver.methodName,
      );
    }

    const loaderCallback = this.externalContextCreator.create(
      instance,
      prototype[resolver.methodName],
      resolver.methodName,
      PARAM_ARGS_METADATA,
      paramsFactory,
      undefined,
      undefined,
      contextOptions,
      'graphql',
    );

    return this.registerFieldMiddlewareIfExists(
      loaderCallback,
      instance,
      resolver.methodName,
    );
  }

  private registerContextProvider<T = any>(request: T, contextId: ContextId) {
    const coreModuleArray = [...this.modulesContainer.entries()]
      .filter(
        ([key, { metatype }]) =>
          metatype && metatype.name === InternalCoreModule.name,
      )
      .map(([key, value]) => value);

    const coreModuleRef = head(coreModuleArray);
    if (!coreModuleRef) {
      return;
    }
    const wrapper = coreModuleRef.getProviderByKey(REQUEST);
    wrapper.setInstanceByContextId(contextId, {
      instance: request,
      isResolved: true,
    });
  }

  private registerFieldMiddlewareIfExists<
    TSource extends object = any,
    TContext = {},
    TArgs = { [argName: string]: any },
    TOutput = any
  >(resolverFn: Function, instance: object, methodKey: string) {
    const fieldMiddleware = Reflect.getMetadata(
      FIELD_RESOLVER_MIDDLEWARE_METADATA,
      instance[methodKey],
    );

    const middlewareFunctions = (
      this.gqlOptions?.buildSchemaOptions?.fieldMiddleware || []
    ).concat(fieldMiddleware || []);

    if (middlewareFunctions?.length === 0) {
      return resolverFn;
    }

    const originalResolveFnFactory = (
      ...args: [TSource, TArgs, TContext, GraphQLResolveInfo]
    ) => () => resolverFn(...args);

    return decorateFieldResolverWithMiddleware<
      TSource,
      TContext,
      TArgs,
      TOutput
    >(originalResolveFnFactory, middlewareFunctions);
  }
}
