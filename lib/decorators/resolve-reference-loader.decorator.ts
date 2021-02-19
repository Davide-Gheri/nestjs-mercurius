import { SetMetadata } from '@nestjs/common';
import { RESOLVER_REFERENCE_METADATA } from '@nestjs/graphql/dist/federation/federation.constants';
import {
  LOADER_PROPERTY_METADATA,
  REFERENCE_LOADER_METADATA,
} from '../constants';

/**
 * Property reference resolver (method) Decorator.
 */
export function ResolveReferenceLoader(): MethodDecorator {
  return (
    target: Function | Object,
    key?: string | symbol,
    descriptor?: any,
  ) => {
    SetMetadata(RESOLVER_REFERENCE_METADATA, true)(target, key, descriptor);
    SetMetadata(REFERENCE_LOADER_METADATA, true)(target, key, descriptor);
    SetMetadata(LOADER_PROPERTY_METADATA, true)(target, key, descriptor);
  };
}
