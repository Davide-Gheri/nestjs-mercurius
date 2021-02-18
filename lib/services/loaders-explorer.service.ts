import { head, identity } from 'lodash';
import { Loader, MercuriusLoaders } from 'mercurius';
import { FastifyReply } from 'fastify';
import { createContextId, REQUEST } from '@nestjs/core';
import { ModulesContainer } from '@nestjs/core/injector/modules-container';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';
import { Injector } from '@nestjs/core/injector/injector';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';
import {
  ContextId,
  InstanceWrapper,
} from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { Inject, Injectable } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { FieldMiddleware, TypeMetadataStorage } from '@nestjs/graphql';
import { BaseExplorerService } from '@nestjs/graphql/dist/services';
import { ObjectTypeMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata';
import {
  PARAM_ARGS_METADATA,
  GRAPHQL_MODULE_OPTIONS,
  FIELD_RESOLVER_MIDDLEWARE_METADATA,
} from '@nestjs/graphql/dist/graphql.constants';
import { MercuriusGqlParamsFactory } from '../factories/params.factory';
import {
  LoaderQuery,
  MercuriusModuleOptions,
  LoaderCtx,
  LoaderMiddleware,
} from '../interfaces';
import { MercuriusParamType } from '../mercurius-param-type.enum';
import { extractMetadata } from '../utils/extract-metadata.util';
import { decorateLoaderResolverWithMiddleware } from '../utils/decorate-loader-resolver.util';

interface LoaderMetadata {
  type: string;
  methodName: string;
  name: string;
  callback: Loader;
  opts?: {
    cache: boolean;
  };
}

@Injectable()
export class LoadersExplorerService extends BaseExplorerService {
  private readonly gqlParamsFactory = new MercuriusGqlParamsFactory();
  private readonly injector = new Injector();

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly externalContextCreator: ExternalContextCreator,
    @Inject(GRAPHQL_MODULE_OPTIONS)
    private readonly gqlOptions: MercuriusModuleOptions,
  ) {
    super();
  }

  explore(): MercuriusLoaders {
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
        opts: loader.opts,
      };
      return acc;
    }, {} as MercuriusLoaders);
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

    const loaders: Omit<
      LoaderMetadata,
      'callback' | 'opts'
    >[] = this.metadataScanner.scanFromPrototype(
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
        const objectTypeMetadata = this.getObjectTypeMetadataByName(
          loader.type,
        );
        const fieldOptions = objectTypeMetadata?.properties.find(
          (p) => p.schemaName === loader.name,
        )?.options as { opts?: { cache: boolean } };

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
          opts: fieldOptions?.opts,
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
    TSource extends LoaderQuery[] = any,
    TContext extends LoaderCtx = LoaderCtx,
    TArgs = { [argName: string]: any },
    TOutput = any
  >(resolverFn: Loader, instance: object, methodKey: string) {
    const fieldMiddleware = Reflect.getMetadata(
      FIELD_RESOLVER_MIDDLEWARE_METADATA,
      instance[methodKey],
    );

    const middlewareFunctions = ((this.gqlOptions?.buildSchemaOptions
      ?.fieldMiddleware || []) as FieldMiddleware<TArgs, TContext>[]).concat(
      fieldMiddleware || [],
    );

    if (middlewareFunctions?.length === 0) {
      return resolverFn;
    }

    const originalResolveFnFactory = (...args: [TSource, TContext]) => () =>
      resolverFn(...args);

    return decorateLoaderResolverWithMiddleware<TSource, TContext, TOutput>(
      originalResolveFnFactory,
      middlewareFunctions,
    );
  }

  private getObjectTypeMetadataByName(
    name: string,
  ): ObjectTypeMetadata | undefined {
    return TypeMetadataStorage.getObjectTypesMetadata().find(
      (m) => m.name === name,
    );
  }
}
