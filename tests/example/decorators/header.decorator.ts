import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '../../../lib';

export const Header = createParamDecorator(
  (name: string, ctx: ExecutionContext) => {
    return GqlExecutionContext.create(ctx).getContext().headers[name];
  },
);
