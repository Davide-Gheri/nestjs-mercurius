export function isLoaderContext(args: any[]) {
  return args.filter(Boolean).length === 2;
}
