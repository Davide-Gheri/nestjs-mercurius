
## Nestjs Mercurius

WIP

### Loader implementation

```typescript

@Resolver(() => Dog)
export class DogResolver {
  @Query(() => [Dog])
  dogs() {
  ...
  }

  @ResolveLoader(() => [String])
  owner(
    @Args({ name: 'someFilter', type: () => String, nullable: true }) someFilter: undefined, 
    @LoaderQueries() queries: LoaderQuery<Dog, { someFilter?: string }>[],
    @LoaderContext() ctx: any,
  ) {
    // queries is an array of objects defined as { obj, params } where obj is the current object and params are the GraphQL params
    
    // Params must be defined as any GraphQL params with @Args decorator but must be accessed from queries[].params 

    return queries.map(({ obj }) => owners[obj.name])
  }
}
```
