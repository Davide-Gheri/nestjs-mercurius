import { ParamData } from '@nestjs/common';
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import { GqlParamtype } from '@nestjs/graphql/dist/enums/gql-paramtype.enum';
import { MercuriusParamType } from '../mercurius-param-type.enum';

export class MercuriusGqlParamsFactory implements ParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any) {
    if (!args) {
      return null;
    }

    switch (type as GqlParamtype | MercuriusParamType) {
      case GqlParamtype.ROOT:
        return args[0];
      case GqlParamtype.ARGS:
        return data && args[1] ? args[1][data as string] : args[1];
      case GqlParamtype.CONTEXT:
        return data && args[2] ? args[2][data as string] : args[2];
      case GqlParamtype.INFO:
        return data && args[3] ? args[3][data as string] : args[3];
      case MercuriusParamType.LOADER_CONTEXT:
        return data && args[1] ? args[1][data as string] : args[1];
      default:
        return null;
    }
  }
}
