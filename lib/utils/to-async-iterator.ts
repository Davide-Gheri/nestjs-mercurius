import { Readable } from 'stream';

export type PubSubSubscribe<TResult = any> =
  Promise<Readable & AsyncIterableIterator<TResult>>
  | (Readable & AsyncIterableIterator<TResult>);

export async function toAsyncIterator<TResult = any>(subPromise: PubSubSubscribe<TResult>) {
  return (await subPromise)[Symbol.asyncIterator]();
}
