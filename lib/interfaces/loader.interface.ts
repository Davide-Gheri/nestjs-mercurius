import { MercuriusContext } from 'mercurius';
import { FastifyReply } from 'fastify';

export interface LoaderQuery<T = any, P = any> {
  obj: T;
  params: P;
}

export type LoaderCtx = MercuriusContext & {
  reply: FastifyReply;
  [key: string]: unknown;
};

export interface LoaderMiddlewareContext<
  TSource = any,
  TContext extends Record<string, any> = LoaderCtx
> {
  source: TSource;
  context: TContext;
}

export declare type NextFn<T = any> = () => Promise<T>;
export interface LoaderMiddleware<
  TSource extends LoaderQuery[] = any,
  TContext extends Record<string, unknown> = LoaderCtx,
  TOutput = any
> {
  (ctx: LoaderMiddlewareContext<TSource, TContext>, next: NextFn):
    | Promise<TOutput>
    | TOutput;
}
