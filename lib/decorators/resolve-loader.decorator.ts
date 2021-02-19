import { SetMetadata, Type } from '@nestjs/common';
import { isFunction, isObject } from '@nestjs/common/utils/shared.utils';
import {
  ReturnTypeFunc,
  FieldMiddleware,
  Complexity,
  GqlTypeReference,
  TypeMetadataStorage,
  BaseTypeOptions,
} from '@nestjs/graphql';
import { FIELD_RESOLVER_MIDDLEWARE_METADATA } from '@nestjs/graphql/dist/graphql.constants';
import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { TypeOptions } from '@nestjs/graphql/dist/interfaces/type-options.interface';
import { reflectTypeFromMetadata } from '@nestjs/graphql/dist/utils/reflection.utilts';
import { LOADER_NAME_METADATA, LOADER_PROPERTY_METADATA } from '../constants';
import { LoaderMiddleware } from '../interfaces';

export interface ResolveLoaderOptions extends BaseTypeOptions {
  name?: string;
  description?: string;
  deprecationReason?: string;
  complexity?: Complexity;
  middleware?: LoaderMiddleware[];
  opts?: {
    cache?: boolean;
  };
}

export function ResolveLoader(
  typeFunc?: ReturnTypeFunc,
  options?: ResolveLoaderOptions,
): MethodDecorator;
export function ResolveLoader(
  propertyName?: string,
  typeFunc?: ReturnTypeFunc,
  options?: ResolveLoaderOptions,
): MethodDecorator;
export function ResolveLoader(
  propertyNameOrFunc?: string | ReturnTypeFunc,
  typeFuncOrOptions?: ReturnTypeFunc | ResolveLoaderOptions,
  resolveFieldOptions?: ResolveLoaderOptions,
): MethodDecorator {
  return (
    target: Function | Record<string, any>,
    key: any,
    descriptor?: any,
  ) => {
    // eslint-disable-next-line prefer-const
    let [propertyName, typeFunc, options] = isFunction(propertyNameOrFunc)
      ? typeFuncOrOptions && typeFuncOrOptions.name
        ? [typeFuncOrOptions.name, propertyNameOrFunc, typeFuncOrOptions]
        : [undefined, propertyNameOrFunc, typeFuncOrOptions]
      : [propertyNameOrFunc, typeFuncOrOptions, resolveFieldOptions];
    SetMetadata(LOADER_NAME_METADATA, propertyName)(target, key, descriptor);
    SetMetadata(LOADER_PROPERTY_METADATA, true)(target, key, descriptor);

    SetMetadata(
      FIELD_RESOLVER_MIDDLEWARE_METADATA,
      (options as ResolveLoaderOptions)?.middleware,
    )(target, key, descriptor);

    options = isObject(options)
      ? {
          name: propertyName as string,
          ...options,
        }
      : propertyName
      ? { name: propertyName as string }
      : {};

    LazyMetadataStorage.store(
      target.constructor as Type<unknown>,
      function resolveLoader() {
        let typeOptions: TypeOptions, typeFn: (type?: any) => GqlTypeReference;
        try {
          const implicitTypeMetadata = reflectTypeFromMetadata({
            metadataKey: 'design:returntype',
            prototype: target,
            propertyKey: key,
            explicitTypeFn: typeFunc as ReturnTypeFunc,
            typeOptions: options as any,
          });
          typeOptions = implicitTypeMetadata.options;
          typeFn = implicitTypeMetadata.typeFn;
        } catch {}

        TypeMetadataStorage.addResolverPropertyMetadata({
          kind: 'external',
          methodName: key,
          schemaName: options.name || key,
          target: target.constructor,
          typeFn,
          typeOptions,
          description: (options as ResolveLoaderOptions).description,
          deprecationReason: (options as ResolveLoaderOptions)
            .deprecationReason,
          complexity: (options as ResolveLoaderOptions).complexity,
        });
      },
    );
  };
}
