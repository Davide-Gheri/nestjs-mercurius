import { ParamData } from '@nestjs/common';
import { GqlParamtype } from '@nestjs/graphql/dist/enums/gql-paramtype.enum';
import { MercuriusParamType } from '../mercurius-param-type.enum';
import { isLoaderContext } from '../utils/is-loader-context';
import { GqlParamsFactory } from '@nestjs/graphql/dist/factories/params.factory';

/**
 * Override GqlParamsFactory for Loader resolvers
 * in Mercurius Loaders parameters differs from a standard graphql resolver
 */
export class LoaderGqlParamsFactory extends GqlParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any) {
    if (!args) {
      return null;
    }

    if (!isLoaderContext(args)) {
      return super.exchangeKeyForValue(type, data, args);
    }

    switch (type as GqlParamtype | MercuriusParamType) {
      case GqlParamtype.ROOT:
        return args[0];
      case GqlParamtype.ARGS:
        return args[0].map(({ params }) =>
          data ? params[data as string] : params,
        );
      case GqlParamtype.CONTEXT:
        return data && args[1] ? args[1][data as string] : args[1];
      default:
        return null;
    }
  }
}
