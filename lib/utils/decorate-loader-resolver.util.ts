import { LoaderQuery, LoaderMiddleware, LoaderCtx } from '../interfaces';

export function decorateLoaderResolverWithMiddleware<
  TSource extends LoaderQuery[] = any,
  TContext extends LoaderCtx = LoaderCtx,
  TOutput = any
>(
  originalResolveFnFactory: (...args: [TSource, TContext]) => Function,
  middlewareFunctions: LoaderMiddleware[] = [],
) {
  return (root: TSource, context: TContext): TOutput | Promise<TOutput> => {
    let index = -1;

    const run = async (currentIndex: number): Promise<TOutput> => {
      if (currentIndex <= index) {
        throw new Error('next() called multiple times');
      }

      index = currentIndex;
      let middlewareFn: LoaderMiddleware;

      if (currentIndex === middlewareFunctions.length) {
        middlewareFn = originalResolveFnFactory(
          root,
          context,
        ) as LoaderMiddleware;
      } else {
        middlewareFn = middlewareFunctions[currentIndex];
      }

      let tempResult: TOutput = undefined;
      const result = await middlewareFn(
        {
          context,
          source: root,
        },
        async () => {
          tempResult = await run(currentIndex + 1);
          return tempResult;
        },
      );

      return result !== undefined ? result : tempResult;
    };
    return run(0);
  };
}
