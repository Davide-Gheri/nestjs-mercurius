import { GqlExecutionContext as NestGqlExecutionContext } from '@nestjs/graphql';
import { ExecutionContext, Type } from '@nestjs/common';

export class GqlExecutionContext extends NestGqlExecutionContext {
  private readonly isLoaderContext: boolean;

  constructor(
    args: any[],
    constructorRef: Type<any> = null,
    handler: Function = null,
  ) {
    super(args, constructorRef, handler);
    // All graphql resolvers have 4 args: Root, Args, Context, Info
    // Only Mercurius Loaders have only 2 args: Queries and Context
    this.isLoaderContext = args.length === 2;
  }

  static create(context: ExecutionContext): GqlExecutionContext {
    const type = context.getType();
    const gqlContext = new GqlExecutionContext(
      context.getArgs(),
      context.getClass(),
      context.getHandler(),
    );
    gqlContext.setType(type);
    return gqlContext;
  }

  getContext<Ctx = any>(): Ctx {
    return this.isLoaderContext ? this.getArgs<Ctx>() : super.getContext<Ctx>();
  }
}
