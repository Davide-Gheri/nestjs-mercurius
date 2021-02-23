import 'reflect-metadata';
import {
  RESOLVER_NAME_METADATA,
  RESOLVER_TYPE_METADATA,
} from '@nestjs/graphql/dist/graphql.constants';
import { LOADER_PROPERTY_METADATA } from '../constants';
import {
  RESOLVER_REFERENCE_KEY,
  RESOLVER_REFERENCE_METADATA,
} from '@nestjs/graphql/dist/federation/federation.constants';

export function extractLoaderMetadata(
  instance: Record<string, any>,
  prototype: any,
  methodName: string,
  filterPredicate: (resolverType: string, isLoaderResolver: boolean) => boolean,
): any {
  const callback = prototype[methodName];
  const resolverType =
    Reflect.getMetadata(RESOLVER_TYPE_METADATA, callback) ||
    Reflect.getMetadata(RESOLVER_TYPE_METADATA, instance.constructor);

  const isLoaderResolver = !!Reflect.getMetadata(
    LOADER_PROPERTY_METADATA,
    callback,
  );

  const isReferenceResolver = !!Reflect.getMetadata(
    RESOLVER_REFERENCE_METADATA,
    callback,
  );

  const resolverName = Reflect.getMetadata(RESOLVER_NAME_METADATA, callback);

  if (filterPredicate(resolverType, isLoaderResolver)) {
    return null;
  }

  const name = isReferenceResolver
    ? RESOLVER_REFERENCE_KEY
    : resolverName || methodName;

  return {
    type: resolverType,
    methodName,
    name,
  };
}
