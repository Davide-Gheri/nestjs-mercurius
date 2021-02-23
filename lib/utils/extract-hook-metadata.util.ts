import 'reflect-metadata';
import {
  RESOLVER_NAME_METADATA,
  RESOLVER_TYPE_METADATA,
} from '@nestjs/graphql/dist/graphql.constants';
import { HOOK_METADATA, LOADER_PROPERTY_METADATA } from '../constants';
import {
  RESOLVER_REFERENCE_KEY,
  RESOLVER_REFERENCE_METADATA,
} from '@nestjs/graphql/dist/federation/federation.constants';
import { HookMap, HookName } from '../decorators';

export interface HookMetadata<N extends HookName> {
  name: N;
  methodName: string;
  callback: HookMap[N];
}

export function extractHookMetadata(
  instance: Record<string, any>,
  prototype: any,
  methodName: string,
) {
  const callback = prototype[methodName];

  const hookName: HookName = Reflect.getMetadata(HOOK_METADATA, callback);

  if (!hookName) {
    return;
  }

  return {
    name: hookName,
    methodName,
    callback,
  } as HookMetadata<typeof hookName>;
}
