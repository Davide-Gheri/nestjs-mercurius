import { SetMetadata } from '@nestjs/common';
import { HOOK_METADATA } from '../constants';
import {
  onResolutionHookHandler,
  preExecutionHookHandler,
  preGatewayExecutionHookHandler,
  preParsingHookHandler,
  preValidationHookHandler,
} from 'mercurius';

export type HookName =
  | 'preParsing'
  | 'preValidation'
  | 'preExecution'
  | 'preGatewayExecution'
  | 'onResolution';

export type HookMap = {
  [K in HookName]: K extends 'preParsing'
    ? preParsingHookHandler
    : K extends 'preValidation'
    ? preValidationHookHandler
    : K extends 'preExecution'
    ? preExecutionHookHandler
    : K extends 'preGatewayExecution'
    ? preGatewayExecutionHookHandler
    : onResolutionHookHandler;
};

export function GraphQLHook<T extends HookName>(hookName: T) {
  return (
    target: Function | Record<string, any>,
    key: any,
    descriptor?: TypedPropertyDescriptor<HookMap[T]>,
  ) => {
    SetMetadata(HOOK_METADATA, hookName)(target, key, descriptor);
  };
}
