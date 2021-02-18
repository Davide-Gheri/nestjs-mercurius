export interface LoaderMiddlewareContext<TSource = any, TContext = {}> {
  source: TSource;
  context: TContext;
}

export declare type NextFn<T = any> = () => Promise<T>;
export interface LoaderMiddleware<TSource = any, TContext = {}, TOutput = any> {
  (ctx: LoaderMiddlewareContext<TSource, TContext>, next: NextFn):
    | Promise<TOutput>
    | TOutput;
}
