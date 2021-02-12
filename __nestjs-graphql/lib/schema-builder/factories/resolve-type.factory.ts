import { Injectable } from '@nestjs/common';
import { isString } from '@nestjs/common/utils/shared.utils';
import { GraphQLTypeResolver } from 'graphql';
import { ResolveTypeFn } from '../../interfaces';
import { TypeDefinitionsStorage } from '../storages/type-definitions.storage';

@Injectable()
export class ResolveTypeFactory {
  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public getResolveTypeFunction<TSource = any, TContext = any>(
    resolveType: ResolveTypeFn<TSource, TContext>,
  ): GraphQLTypeResolver<TSource, TContext> {
    return async (...args) => {
      const resolvedType = await resolveType(...args);
      if (isString(resolvedType)) {
        return resolvedType;
      }
      const typeDef = this.typeDefinitionsStorage.getObjectTypeByTarget(
        resolvedType,
      );
      return typeDef?.type;
    };
  }
}
