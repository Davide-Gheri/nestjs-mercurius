import { PipeTransform, Type } from '@nestjs/common';
import { createGqlPipesParamDecorator } from '@nestjs/graphql/dist/decorators/param.utils';
import { MercuriusParamType } from '../mercurius-param-type.enum';

export function LoaderQueries(): ParameterDecorator;
export function LoaderQueries(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createGqlPipesParamDecorator(MercuriusParamType.LOADER_QUERIES as any)(...pipes);
}
