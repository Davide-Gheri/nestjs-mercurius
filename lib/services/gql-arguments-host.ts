import { GqlArgumentsHost as NestGqlArgumentsHost } from '@nestjs/graphql';
import { ArgumentsHost } from '@nestjs/common';
import { isLoaderContext } from '../utils/is-loader-context';

export class GqlArgumentsHost extends NestGqlArgumentsHost {
  private readonly isLoaderContext: boolean;

  constructor(args: any[]) {
    super(args);
    // All graphql resolvers have 4 args: Root, Args, Context, Info
    // Only Mercurius Loaders have only 2 args: Queries and Context
    this.isLoaderContext = isLoaderContext(args);
  }

  static create(context: ArgumentsHost): GqlArgumentsHost {
    const type = context.getType();
    const gqlContext = new GqlArgumentsHost(context.getArgs());
    gqlContext.setType(type);
    return gqlContext;
  }

  getContext<Ctx = any>(): Ctx {
    return this.isLoaderContext ? this.getArgs<Ctx>() : super.getContext<Ctx>();
  }
}
