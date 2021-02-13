import { PipeTransform, Type } from '@nestjs/common';
import 'reflect-metadata';
import { createGqlPipesParamDecorator } from '@nestjs/graphql/dist/decorators/param.utils';
import { MercuriusParamType } from '../mercurius-param-type.enum';

export function LoaderContext(): ParameterDecorator;
export function LoaderContext(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function LoaderContext(
  property: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator;
export function LoaderContext(
  property?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createGqlPipesParamDecorator(MercuriusParamType.LOADER_CONTEXT as any)(
    property,
    ...pipes,
  );
}
