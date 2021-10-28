import { MercuriusModuleOptions } from '../interfaces';
import { isFunction } from '@nestjs/common/utils/shared.utils';

// TODO better define this
const defaultOptions: MercuriusModuleOptions = {
  graphiql: true,
  routes: true,
  path: '/graphql',
  fieldResolverEnhancers: [],
  cache: true,
};

export function mergeDefaults(
  options: MercuriusModuleOptions,
  defaults: MercuriusModuleOptions = defaultOptions,
): MercuriusModuleOptions {
  const moduleOptions = {
    ...defaults,
    ...options,
  };
  if (!moduleOptions.context) {
    moduleOptions.context = (req, reply) => ({ req });
  } else if (isFunction(moduleOptions.context)) {
    moduleOptions.context = async (req, reply) => {
      const ctx = await (options.context as Function)(req, reply);
      return assignReqProperty(ctx, req);
    };
  } else {
    moduleOptions.context = (req, reply) => {
      return assignReqProperty(options.context as Record<string, any>, req);
    };
  }
  return moduleOptions;
}

function assignReqProperty(
  ctx: Record<string, unknown> | undefined,
  req: unknown,
) {
  if (!ctx) {
    return { req };
  }
  if (
    typeof ctx !== 'object' ||
    (ctx && ctx.req && typeof ctx.req === 'object')
  ) {
    return ctx;
  }
  ctx.req = req;
  return ctx;
}
